import {playMode} from 'common/js/config';
import {loadSearch, loadPlay, loadFavorite} from 'common/js/cache';
const state = {
    singer: {},
    playing: false,
    fullScreen: false,
    playList: [],
    sequenceList: [],
    mode: playMode.sequence,
    currentIndex: -1,
    disc: {},
    topList: {},
    searchHistory: loadSearch(), // 初始值从缓存里读数据
    playHistory: loadPlay(), // 初始值从缓存里读数据
    favoriteList: loadFavorite() // 收藏歌曲数据
}
export default state;