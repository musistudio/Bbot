// 从讯飞流式识别中抽离录音器对象
// 详细代码可以在讯飞开放平台中找到流式识别的前端js代码

let transWorker = new Worker('./static/js/transcode.worker.js');
class Recorder {
  constructor() {
    let self = this;
    this.status = 'null';
    // 记录音频数据
    this.audioData = [];
    // 记录听写结果
    this.resultText = '';
    // wpgs下的听写结果需要中间状态辅助记录
    this.resultTextTemp = '';
    transWorker.onmessage = function (event) {
      self.audioData.push(...event.data);
    };
  }
  // 修改录音听写状态
  setStatus(status) {
    this.onWillStatusChange &&
      this.status !== status &&
      this.onWillStatusChange(this.status, status);
    this.status = status;
  }
  setResultText({ resultText, resultTextTemp } = {}) {
    this.onTextChange && this.onTextChange(resultTextTemp || resultText || '');
    resultText !== undefined && (this.resultText = resultText);
    resultTextTemp !== undefined && (this.resultTextTemp = resultTextTemp);
  }
  // 修改听写参数
  setParams({ language, accent } = {}) {
    language && (this.language = language);
    accent && (this.accent = accent);
  }
  // 初始化浏览器录音
  recorderInit() {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;
    // 创建音频环境
    try {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.audioContext.resume();
      if (!this.audioContext) return alert('浏览器不支持webAudioApi相关接口');
    } catch (e) {
      if (!this.audioContext) return alert('浏览器不支持webAudioApi相关接口');
    }
    // 获取浏览器录音权限
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: false,
        })
        .then((stream) => {
          getMediaSuccess(stream);
        })
        .catch((e) => {
          getMediaFail(e);
        });
    } else if (navigator.getUserMedia) {
      navigator.getUserMedia(
        {
          audio: true,
          video: false,
        },
        (stream) => {
          getMediaSuccess(stream);
        },
        function (e) {
          getMediaFail(e);
        }
      );
    } else {
      if (
        navigator.userAgent.toLowerCase().match(/chrome/) &&
        location.origin.indexOf('https://') < 0
      ) {
        alert('chrome下获取浏览器录音功能，因为安全性问题，需要在localhost或127.0.0.1或https下才能获取权限');
      } else {
        alert('无法获取浏览器录音功能，请升级浏览器或使用chrome');
      }
      this.audioContext && this.audioContext.close();
      return;
    }
    // 获取浏览器录音权限成功的回调
    let getMediaSuccess = (stream) => {
      console.log('getMediaSuccess');
      // 创建一个用于通过JavaScript直接处理音频
      this.scriptProcessor = this.audioContext.createScriptProcessor(0, 1, 1);
      this.scriptProcessor.onaudioprocess = (e) => {
        // 处理音频数据
        if (this.status === 'ing') {
          transWorker.postMessage(e.inputBuffer.getChannelData(0));
        }
      };
      // 创建一个新的MediaStreamAudioSourceNode 对象，使来自MediaStream的音频可以被播放和操作
      this.mediaSource = this.audioContext.createMediaStreamSource(stream);
      // 连接
      this.mediaSource.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);
    };

    let getMediaFail = (e) => {
      alert('请求麦克风失败');
      console.log(e);
      this.audioContext && this.audioContext.close();
      this.audioContext = undefined;
    };
  }
  recorderStart() {
    if (!this.audioContext) {
      this.recorderInit();
    } else {
      this.audioContext.resume();
    }
    this.setStatus('ing');
  }
  // 暂停录音
  recorderStop() {
    // safari下suspend后再次resume录音内容将是空白，设置safari下不做suspend
    if (
      !(
        /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgen)
      )
    ) {
      this.audioContext && this.audioContext.suspend();
    }
    this.audioContext && this.audioContext.suspend();
    this.audioContext = null;
    this.setStatus('end');
    return this.audioData;
  }
  // 对处理后的音频数据进行编码，
  toBase64(buffer) {
    var binary = '';
    var bytes = new Uint8Array(buffer);
    return bytes;
  }
  start() {
    this.recorderStart();
    this.setResultText({ resultText: '', resultTextTemp: '' });
  }
  stop() {
    return this.recorderStop();
  }
}
