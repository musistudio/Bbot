class AlarmPlugin{
    constructor() {
        this.service = "scheduleX";
        this.SLUG = 'Alarm';
    }
    // 接受参数
    // io: socket io
    // text: 语音识别结果
    // intent：意图对象
    async handle(text, intent) {
        let { intent: intent_name, slots} = intent.semantic[0];
        console.log(slots);
        let results;
        try{
            switch(intent_name) {
                case 'CREATE':
                    let answer = intent.answer.text;
                    let type = slots.filter(slot => slot.name == 'name');
                    if(type.length) type = type[0].value;
                    let time = slots.filter(slot => slot.name == 'datetime');
                    if(time.length) {
                        time = JSON.parse(time[0].normValue).datetime;
                    }
                    if(type == 'reminder') {
                        let content = slots.filter(slot => slot.name == 'content');
                        if(content.length) content = content[0].value;
                        results =  {cmd: 'alarm_create', data: { time, type, content, answer }};
                        break;
                    }
                    results = {cmd: 'alarm_create', data: { time, type, answer }}
                    break;
            }
        }catch(e) {
            results = {cmd: 'say', data: { text: `插件${this.SLUG}出故障了` }}
            console.log(e)
        }  
        return results;
    }
}

exports.AlarmPlugin = AlarmPlugin;
