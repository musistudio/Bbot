const axios = require('axios');

class MusicPlugin{
    constructor() {
        this.service = "OS1194626903.music_demo"
        this.SLUG = 'music'
    }

    async search(name, singer) {
        const song = await axios.get(`http://localhost:3333/song/box?name=${encodeURIComponent(name)}&singer=${encodeURIComponent(singer)}`);
        if(song.data.code) {
            return song.data.data;
        }
    }

    // 接受参数
    // io: socket io
    // text: 语音识别结果
    // intent：意图对象
    async handle(text, intent) {
        let { intent: intent_name, slots} = intent.semantic[0];
        let results;
        try{
            switch(intent_name) {
                case 'search_by_song':
                    let singer = slots.filter(slot => (slot.name == 'actor' || slot.name == 'artist'))
                    let song = slots.filter(slot => slot.name == 'song')
                    singer = singer.length ? singer[0].normValue : '';
                    song = song.length ? song[0].normValue : '';
                    let songs = await this.search(song, singer);
                    results = {
                        app: 'speaker',
                        handler: 'play',
                        data: songs
                    }
                    break;
                case 'control':
                    let cmd= slots.map(slot => slot.name);
                    cmd && cmd.length && (cmd = cmd[0]);
                    results = {cmd}
            }
        }catch(e) {
            results = {cmd: 'say', data: { text: `插件${this.SLUG}出故障了` }}
            console.log(e)
        }  
        return results;
    }

    // IOHandle(io, data) {

    //     io.emit('client', {data});
    // }
}

exports.MusicPlugin = MusicPlugin;
