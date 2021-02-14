export default class Speaker {
    constructor() {
        this.media = document.createElement('audio');
        this.playList = [];
        this.playIndex = 0;
        this.media.volume = 0.5;
        this.media.addEventListener('ended', () => {
            this.next();
        })
    }

    say(url) {
        this.media.src = url;
        this.media.play();
    }

    play(songs) {
        if(songs) {
            this.playIndex = this.playList.length;
            if(Array.isArray(songs)) {
                this.playList = this.playList.concat(songs)
            }else{
                this.playList.push(songs);
            }
            this.media.src = this.playList[this.playIndex];
        }
        this.media.play();
    }

    volumeUp() {
        this.media.volume < 1 && this.media.volume++;
    }

    volumeDown() {
        this.media.volume > 0 && this.media.volume--;
    }

    next() {
        this.playIndex = (++this.playIndex) % this.playList.length;
        this.media.src = this.playList[this.playIndex];
        this.play();
    }

    last() {
        this.playIndex = (--this.playIndex + this.playList.length) % this.playList.length;
        this.media.src = this.playList[this.playIndex];
        this.play();
    }

    clearPlayList() { // 清空播放列表
        this.playList = [];
    }

    addPlayList(data) { // 添加到播放列表
        if(Array.isArray(data)) {
            this.playList.concat(data);
        }else{
            this.playList.push(data);
        }
    }
}
