// 封装播放器
function Player(element, robot) {
  _Player = element;
  _play_list = [];
  _index = 0;
  _loaded = false;
  _Player.volume = 0.6;
  this.plugin_SLUG = null;
  this.status = null;
  this.inited = false;
  this.loop = true;
  this.robot = robot;
  // 监听播放结束事件，实现连续播放
  _Player.addEventListener('ended', () => {
    if(_play_list.length) {
      this.next();
      this.play();
    }
  });
  // 添加列表
  this.push = function (arr) {
    _play_list = _play_list.concat(arr);
    this.inited = true;
  };
  // 清空播放列表
  this.clear = function () {
    _play_list = [];
    _index = 0;
  };
  // 播放
  this.play = function () {
    if (_Player.src == location.href) {
      _Player.src = _play_list[_index].url
      _Player.load();
    };
    if(this.status == 'pause') {
      _Player.play();
    }else{
      this.robot.say(`正在为您播放：${ _play_list[_index].text}`, () => {
          _Player.play();
      })
    }
    this.status = 'play';
  };
  // 暂停
  this.pause = function () {
    this.status = 'pause';
    _Player.pause();
  };
  // 下一首
  this.next = function () {
    _index++;
    if (_index >= _play_list.length) _index = 0;
    let { name, url } = _play_list[_index];
    // if (!_loaded && _play_list.length - _index <= 3)
    //   socket.json({
    //     event: 'forward',
    //     target: 'Server',
    //     SLUG: 'QQMusic',
    //     data: JSON.stringify({ cmd: 'loadMore' }),
    //   });
    _Player.src = url;
    _Player.load();
    this.status = null;
    this.play();
  };
  // 上一首
  this.last = function () {
    _index--;
    if (_index < 0) _index = _play_list.length - 1;
    let { name, url } = _play_list[_index];
    _Player.src = url;
    _Player.load();
    this.status = null;
    this.play();
  };
  // 加音量
  this.volumeUp = function () {
    if (_Player.volume < 1) {
      _Player.volume += 0.2;
    }
  };
  // 减音量
  this.volumeDown = function () {
    if (_Player.volume > 0) {
      _Player.volume -= 0.2;
    }
  };
  this.stop = function () {
    this.pause;
    this.inited = false;
    this.status = null;
    _Player.src = '';
    _play_list = [];
    _index = 0;
    _loaded = false;
  };
}
