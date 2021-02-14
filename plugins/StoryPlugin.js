class StoryPlugin{
    constructor() {
        this.service = 'story'
        this.SLUG = 'Story'
    }
    
    // 接受参数
    // io: socket io
    // text: 语音识别结果
    // intent：意图对象
    async handle(text, intent) {
        let {data} = intent;
        data = data.result.map(dt => ({
            text: dt.name,
            url: dt.playUrl
        }))
        let results = {cmd: 'play', data: { datas: data }}
        return results;
    }
}

exports.StoryPlugin = StoryPlugin;
