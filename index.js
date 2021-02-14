const express = require('express');
const child_process = require('child_process');
const { getNLP } = require('./apis/aiui');
var bodyParser = require('body-parser');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
const { Plugins } = require('./plugins');

app.use(bodyParser.json({ limit: '10240kb' }));
app.use(bodyParser.urlencoded({ limit: '10240kb' }));
app.use(express.static('./'));

// 查找插件
function findPlugin(service) {
  let plugins = Plugins.filter((plg) => plg.service == service);
  return plugins.length ? plugins[0] : null;
}

// websocket处理
io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('client', (msg) => {
    io.emit('client', msg);
    console.log('message: ' + msg);
  });
  socket.on('snowboy', (msg) => {
    io.emit('client', msg);
    console.log('snowboy: ' + msg.cmd);
  });
  // 赋予插件websocket能力，使其能直接与前端进行交互
  // const SLUGS = Plugins.map((plugin) => plugin.SLUG);
  Plugins.forEach((plugin) => {
    if (plugin.IOHandle && typeof plugin.IOHandle == 'function') {
      socket.on(plugin.SLUG, (msg) => {
        plugin.IOHandle(io, msg);
      });
    }
  });
});

// nlp处理
app.post('/nlp', async (req, res) => {
  let { data } = req.body;
  let result = await getNLP(Buffer.from(data));
  // 技能处理开始
  // 1. 获取语音识别的结果和响应的意图
  let { data: datas } = result.data;
  let iats = datas.filter((dt) => dt.sub == 'iat');
  let nlps = datas.filter((dt) => dt.sub == 'nlp');
  iats = iats.filter((iat) => iat.text);
  nlps = nlps.filter(
    (nlp) =>
      nlp.intent.answer || (nlp.intent.semantic && nlp.intent.semantic.length)
  );
  let text, intent;
  iats.length && iats[0].text && (text = iats[0].text);
  nlps.length && (intent = nlps[0].intent);
  console.log(`语音识别结果: ${text}`);
  // 2. text为语音识别结果 intent为响应的意图
  if (intent) {
    let dts;
    try {
      const plugin = findPlugin(intent.service);
      if(plugin && plugin.handle) {
        dts = await plugin.handle(io, text, intent)
        console.log(`命中插件: ${plugin.SLUG}`);
      }
    } catch (e) {
      console.log(e);
    }
    if (dts) return res.json(dts);
  }
  // 技能处理结束
  res.json(result.data);
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});


let url = 'http://localhost',
  port = 3000,
  cmd = '';
switch (process.platform) {
  case 'wind32':
    cmd = 'start';
    break;
  case 'linux':
    cmd = 'xdg-open';
    break;
  case 'darwin':
    cmd = 'open';
    break;
}
child_process.exec(cmd + ' ' + url + ':' + port);
child_process.exec('node microphone.js');
