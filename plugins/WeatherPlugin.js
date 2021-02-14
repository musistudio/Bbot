class WeatherPlugin{
    constructor() {
        this.service = "weather"
        this.SLUG = 'Weather'
    }
    // 接受参数
    // io: socket io
    // text: 语音识别结果
    // intent：意图对象
    async handle(text, intent) {
        let { answer, data} = intent;
        let results = {cmd: 'say', data: { text: `${answer.text}` }}
        return results;
    }
}

exports.WeatherPlugin = WeatherPlugin;
