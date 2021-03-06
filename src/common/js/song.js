import {getUid} from './uid';
import {getVKey, getLyric} from 'api/song';
import {ERR_OK} from 'api/config';
import {Base64} from 'js-base64';
let urlMap = {};
export default class Song {
    constructor({id, mid, singer, name, album, duration, image, url}) {
        this.id = id;
        this.mid = mid;
        this.singer = singer;
        this.name = name;
        this.album = album;
        this.duration = duration;
        this.image = image;
        this.filename = `C400${this.mid}.m4a`;
        if (urlMap[this.id]) {
            this.url = urlMap[this.id];
        } else {
            this._genUrl();
        }
    }

    // 获取歌词数据并返回歌词数据
    getLyric(){
        // 如果lyric存在就直接return 不需要每次都请求数据
        if(this.lyric) {
            return Promise.resolve(this.lyric);
        }

        return new Promise((resolve, reject) => {
            getLyric(this.mid).then((res) => {
                if(res.retcode === ERR_OK){
                    this.lyric = Base64.decode(res.lyric);
                    resolve(this.lyric);
                } else {
                    reject('no lyric');
                }
            })
        });
    }

    // 获取歌曲播放链接
    _genUrl() {
        if (this.url) {
          return;
        }
        getVKey(this.mid, this.filename).then((res) => {
            if (res.code === ERR_OK) {
                const vkey = res.data.items[0].vkey;
                this.url = `http://dl.stream.qqmusic.qq.com/${this.filename}?vkey=${vkey}&guid=${getUid()}&uin=0&fromtag=66`;
                urlMap[this.id] = this.url;
            }
        });
    }
}

export function createSong(musicData){
    return new Song({
        id: musicData.songid,
        mid: musicData.songmid,
        singer: filterSinger(musicData.singer),
        name: musicData.songname,
        album: musicData.albumname,
        duration: musicData.interval,
        image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`
    });
}

export function filterSinger(singer){
    let ret = [];
    if(!singer){
        return '';
    }
    singer.forEach((s) => {
        ret.push(s.name);
    });
    return ret.join('/');
}