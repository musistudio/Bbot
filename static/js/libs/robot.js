function Say(element) {
  _Say = element;
  _Say.volume = 0.6;
  // 播放
  this.play = function (src, callback) {
    // 监听播放结束事件，实现连续播放
    callback &&
      typeof callback == 'function' &&
      (_Say.onended = function () {
        callback();
      });
    this.stop();
    _Say.src = src;
    _Say.load();
    _Say.play();
  };
  this.stop = function () {
    this.pause;
    _Say.src = '';
    _Say.load();
  };
}

let recorder = new Recorder();

class Robot {
  constructor(element, PlayerElement) {
    this.listening = false;
    this.Say = element ? new Say(element) : new Say(document.querySelector('#robot'));
    this.Player = PlayerElement ? new Player(PlayerElement, this) : new Player(document.querySelector('#player'), this);
    this.keep_silence = 2;
    this.wakeup_sounds = [
      'static/sounds/wake_up_0.m4a',
      'static/sounds/wake_up_1.m4a',
      'static/sounds/wake_up_2.m4a',
      'static/sounds/wake_up_3.m4a',
      'static/sounds/wake_up_4.m4a',
      'static/sounds/wake_up_5.m4a',
      'static/sounds/wake_up_6.m4a',
      'static/sounds/wake_up_7.m4a',
      'static/sounds/wake_up_8.m4a',
    ];
  }

  wakeup() {
    if(this.Player.status == 'play') this.Player.pause();
    this.keep_silence = 2;
    this.Say.play(
      `http://localhost:3000/${
        this.wakeup_sounds[Math.round(Math.random() * 8)]
      }`,
      () => this.listen()
    );
  }

  listen() {
    this.listening = true;
    recorder.start();
  }

  stop_listen() {
    if (this.listening) {
      this.keep_silence--;
    }
    if (this.keep_silence == 0) {
      this.listening = false;
      let voice = recorder.stop();
      this.nlp(voice);
      this.keep_silence = 2;
    }
  }

  say(text, callback) {
    let url = `https://tts.baidu.com/text2audio?tex=${text}&cuid=baike&lan=ZH&ctp=1&pdt=301&vol=9&rate=32&per=110`;
    this.Say.play(url, callback);
  }

  play(url, callback) {
    this.Say.play(url, callback);
  }

  nlp(data) {
    axios.post('/nlp', { data })
    .then((res) => {
      const { cmd, data } = res.data;
      console.log(cmd, data);
      switch(cmd) {
        case 'play':
          this.Player.stop();
          this.Player.clear();
          this.Player.push(data.datas);
          this.Player.play();
          break;
        case 'next':
          this.Player.next();
          break;
        case 'prev':
          this.Player.last();
          break;
        case 'say':
          this.say(data.text);
          break;
        case 'alarm_create':
          this.say(data.answer);
          db.add('crontab', {...data, state: 'on'})
          break;
      }
      if(this.Player.inited && this.Player.status == 'pause') this.Player.play();
      
      // const { data } = res;
        // if (data.code == '0') {
        //     if (data.data.length) {
        //         let nlps = data.data.filter((dt) => dt.sub == 'nlp');
        //         let nlp = nlps.filter(np => np.intent.answer);
        //         nlp.length && (nlp = nlp[0]);
        //         console.log(nlp);
        //         const { text } = nlp.intent.answer;
        //         let { data: datas, service } = nlp.intent;
        //         datas = datas.result;
        //         let callback;
        //         if(service == 'story') {
        //             datas = datas.map(dt => ({
        //                 name: dt.name,
        //                 url: dt.playUrl,
        //             }))
        //             callback = () => {
        //                 this.Player.stop();
        //                 this.Player.clear();
        //                 this.Player.push(datas);
        //                 _loaded = true;
        //                 this.Player.play();
        //             }
        //         }
        //         text && this.say(nlp.intent.answer.text, callback);
        //     }
        // }
    })
    .catch((err) => {
        console.log(err);
    })
    .finally(() => {
        recorder.audioData = [];
    });

  }
}
