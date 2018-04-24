import {commonParams, options} from './config'
import {getUid} from 'common/js/uid'
import jsonp from 'common/js/jsonp'
import axios from 'axios'

/*** 获取歌曲播放key
* @author   lipenghui
* @version  1.1.0
* @params   songmid     filename
* @return   请求返回的数据
*/
export function getVKey(songmid, filename) {
    const url = 'https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg'
    const data = Object.assign({}, commonParams, {
        cid: 205361747,
        format: 'json',
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0,
        uin: 0,
        songmid,
        filename,
        guid: getUid()
    })
    return jsonp(url, data, Object.assign({}, options, {
        param: 'callback'
    }));
}


/*** 获取歌曲的歌词
* @author   lipenghui
* @version  1.1.0
* @params   mid
* @return   请求返回的数据
*/
export function getLyric(mid){
    const url = 'api/lyric';
    const data = Object.assign({}, commonParams, {
        songmid: mid,
        pcachetime: +new Date(),
        platform: 'yqq',
        hostUin: 0,
        needNewCode: 0,
        categoryId: 10000000,
        g_tk: 67232076,
        format: 'json'
    });

    return axios.get(url, {
        params: data
    }).then((res) => {
        return Promise.resolve(res.data);
    })
}