const Detector = require('./lib/snowboy/').Detector;
const Models = require('./lib/snowboy/').Models;
const { record } = require('node-record-lpcm16');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { aiui } = require('./config');
const { Plugins, findPlugin } = require('./plugins');
const helper = require('./utils/helper');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('./'));



const models = new Models();
const state = {
  type: 'SILENCE',
  count: 0,
  recoder: null,
  inputStream: null
}

models.add({
  file: 'resources/models/snowboy.umdl',
  sensitivity: '0.6',
  hotwords: 'snowboy'
});


class Listener {
  constructor(callback) {
    this.state = 'SILENCE';
    this.count = 0;
    this.recoder = null;
    this.inputStream = null;
    this.detector = new Detector({
      resource: "resources/common.res",
      models: models,
      audioGain: 1.0,
      applyFrontend: false
    });
    this.detector.on("silence", this.onSlience.bind(this));
    this.detector.on("sound", this.onSound.bind(this));
    this.detector.on("hotword", this.onHotword.bind(this));
    this.recordCallback = callback;
  }

  // 如果处于录音状态且静默超过三次则认为对话结束
  onSlience() {
    console.log('静默状态');
    if (this.state === 'LISTENING') {
      this.count++;
      if (this.count > 3) {
        console.log('结束录音');
        this.state = 'SILENCE';
        this.count = 0;
        this.recoder.unpipe(state.inputStream);
        this.inputStream.destroy();
        this.recoder = null;
        this.inputStream = null;
        typeof this.recordCallback === 'function' && this.recordCallback(fs.readFileSync('./record.wav'));
      }
    }
  }

  // 如果处于录音状态且检测到有声音则将静默次数置为0
  onSound() {
    console.log('检测到声音');
    if (this.state === 'LISTENING') {
      console.log('录音中');
      this.count = 0;
    }
  }

  // 如果检测到唤醒词则开始录音
  onHotword() {
    console.log('开始录音');
    this.state = 'LISTENING';
    this.inputStream = fs.createWriteStream(
      path.resolve(__dirname, "./record.wav"),
      {
        encoding: "binary",
      }
    );
    this.recoder = record({
      sampleRate: 16000,
      threshold: 0.9,
      recorder: 'rec',
    }).stream();
    this.recoder.pipe(this.inputStream);
  }

  start() {
    const mic = record({
      sampleRate: 16000,
      threshold: 0.9,
      recorder: 'rec',
    }).stream()
    mic.pipe(this.detector);
  }
}

class Brain {
  constructor() {
    const listener = new Listener(this.thinking.bind(this))
    listener.start()
  }

  // 获取语音的NLP处理结果
  async getNLPResult(voiceBuffer) {
    let param = JSON.stringify({
      result_level: aiui.RESULT_LEVEL,
      aue: aiui.AUE,
      scene: aiui.SCENE,
      auth_id: aiui.AUTH_ID,
      data_type: aiui.DATA_TYPE,
      sample_rate: aiui.SAMPLE_RATE,
      lat: aiui.LAT,
      lng: aiui.LNG,
    });
    let X_CurTime = Math.floor(Date.now() / 1000);
    let X_Param = Buffer.from(param).toString('base64');
    let X_CheckSum = helper.md5(aiui.API_KEY + X_CurTime + X_Param);
    let res = await axios({
      method: 'POST',
      url: 'http://openapi.xfyun.cn/v2/aiui',
      headers: {
        'X-Param': X_Param,
        'X-CurTime': X_CurTime,
        'X-CheckSum': X_CheckSum,
        'X-Appid': aiui.APPID,
      },
      data: voiceBuffer,
    });
    return res;
  }

  async thinking(voiceBuffer) {
    console.log('开始处理语音')
    const result = await this.getNLPResult(voiceBuffer);
    // 技能处理开始
    // 1. 获取语音识别的结果和响应的意图
    let { data: datas } = result.data;
    let iats = datas.filter(dt => dt.sub === 'iat' && dt.text);
    let nlps = datas.filter(dt => dt.sub === 'nlp' && (dt.intent.answer || (dt.intent.semantic && dt.intent.semantic.length)));
    let text, intent, pluginResult;
    try {
      iats.length && iats[0].text && (text = iats[0].text);
      nlps.length && (intent = nlps[0].intent);
      console.log(`语音识别结果: ${text} 触发意图: ${JSON.stringify(intent)}`);
      // 2. text为语音识别结果 intent为响应的意图
      if (intent) {
        try {
          const plugin = findPlugin(Plugins, intent.service);
          if (plugin && plugin.handle) {
            pluginResult = await plugin.handle(text, intent)
            console.log(`命中插件: ${plugin.SLUG}`);
          }
        } catch (e) {
          console.log(e);
        }
      }
      // 技能处理结束
      if (pluginResult) {
        console.log(pluginResult)
        if (pluginResult.app) {
          io.emit('client', JSON.stringify(pluginResult))
        }
      } else {
        if (intent.answer) {
          console.log(intent.answer.text)
        } else {
          console.log(intent)
        }
      }
    } catch (e) {
      console.log(e);
    }
  }
}

class Speaker {
  constructor() { }

  say(text) { }

}


class Player {
  constructor() { }

  // 播放
  play() { }

  // 暂停
  pause() { }

  // 停止播放
  stop() { }

  // 下一首
  next() { }

  // 上一首
  last() { }

  // 音量+
  volUp() { }

  // 音量-
  volDown() { }
}

class Robot {
  constructor() {

  }
}

// websocket处理
io.on('connection', (socket) => {
  console.log('a client connected');
  // io.emit('client', JSON.stringify({
  //   app: 'speaker',
  //   handler: 'say',
  //   data: 'https://tts.baidu.com/text2audio?tex=%E6%9B%BE%E7%BB%8F%E6%88%91%E8%87%AA%E8%AF%A9%E5%8D%8A%E4%B8%AA%E8%AF%97%E4%BA%BA%EF%BC%8C%E8%A7%81%E5%B1%B1%E6%98%AF%E6%B7%B1%E6%83%85%E4%BC%9F%E5%B2%B8%EF%BC%8C%E8%A7%81%E6%B5%B7%E6%98%AF%E7%83%AD%E6%83%85%E6%BE%8E%E6%B9%83%EF%BC%8C%E8%A7%81%E8%8A%B1%E8%A7%81%E8%8D%89%E4%BF%A1%E4%BB%96%E4%BB%AC%E7%9A%86%E6%9C%89%E6%95%85%E4%BA%8B%EF%BC%8C%E4%BA%91%E6%B5%B7%E6%B1%9F%E6%BD%AE%EF%BC%8C%E8%99%AB%E9%B8%A3%E9%B8%9F%E5%95%BC%E9%83%BD%E6%9A%97%E8%97%8F%E6%83%85%E6%84%AB%E3%80%82%E5%94%AF%E7%8B%AC%E8%A7%81%E4%BA%86%E4%BD%A0%EF%BC%8C%E5%B1%B1%E5%B7%9D%E6%B2%89%E9%BB%98%EF%BC%8C%E6%B5%B7%E9%9D%A2%E9%9D%99%E8%B0%A7%EF%BC%8C%E4%BA%91%E6%B5%B7%E4%B8%8D%E5%86%8D%E7%BF%BB%E6%B6%8C%EF%BC%8C%E6%B1%9F%E6%BD%AE%E4%B8%8D%E5%86%8D%E6%BE%8E%E6%B9%83%EF%BC%8C%E8%8A%B1%E9%B8%9F%E9%B1%BC%E8%99%AB%E8%A2%AB%E5%85%89%E4%B8%8E%E5%B0%98%E5%87%9D%E5%9B%BA%EF%BC%8C%E4%B8%96%E7%95%8C%E4%B8%87%E7%B1%81%E4%BF%B1%E5%AF%82%EF%BC%8C%E5%8F%AA%E5%89%A9%E4%B8%8B%E4%BD%A0%E3%80%82&cuid=baike&lan=ZH&ctp=1&pdt=301&vol=9&rate=32&per=3'
  // }))
  socket.on('disconnect', () => {
    console.log('client disconnected');
  });
  socket.on('server', (msg) => {
    const parse_data = JSON.parse(msg)
    console.log('receive client message: ', parse_data);
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

const brain = new Brain();
