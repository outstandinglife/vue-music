import * as types from './mutation-types';
import {playMode} from 'common/js/config';
import {shuffle} from 'common/js/utli';
import {saveSearch, deleteSearch, clearSearch, savePlay, saveFavorite, deleteFavorite} from 'common/js/cache';



function findIndex(list, song){
    return list.findIndex((item) => {
        return item.id === song.id;
    });
}





export const selectPlay = function({commit, state}, {list, index}){
    commit(types.SET_SEQUENCE_LIST, list);
    // 判断是否是随机播放模式
    if(state.mode === playMode.random){
        // 对歌曲数据进行随机排序
        let randomList = shuffle(list);
        commit(types.SET_PLAYLIST, randomList);
        // 设置当前歌曲的index和随机播放的id一致
        index = findIndex(randomList, list[index]);
    } else { 
        // 顺序和单曲播放
        commit(types.SET_PLAYLIST, list);
    }
    commit(types.SET_CURRENT_INDEX, index);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATE, true);
}






export const randomPlay = function({commit}, {list}){
    commit(types.SET_PLAY_MODE, playMode.random);
    commit(types.SET_SEQUENCE_LIST, list);
    let randomList = shuffle(list);
    commit(types.SET_PLAYLIST, randomList);
    commit(types.SET_CURRENT_INDEX, 0);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATE, true);
}






export const insertSong = function({commit, state}, song){
    // .slice()方法返回副本，不会修改原来的数据 副本修改之后在提交到state里
    let playList = state.playList.slice();
    let sequenceList = state.sequenceList.slice();
    let currentIndex = state.currentIndex;

    // 记录当前歌曲
    let currentSong = playList[currentIndex];

    // 查找当前歌曲列表中是否有待插入的当前歌曲，并返回其索引
    let fpIndex = findIndex(playList, song);

    // 因为要插入的歌曲当前播放歌曲的下一首，所有currentIndex要加1
    currentIndex++;

    // 然后把带插入的歌曲插入歌曲列表中(当前的索引位置)
    playList.splice(currentIndex, 0, song);

    // 判断如果已经包含了这首歌
    if(fpIndex > -1) {
        // 当前插入的索引大于当前列表中的索引
        if(currentIndex > fpIndex) {
            // 删除找到的索引
            playList.splice(fpIndex, 1);
            currentIndex--;
        } else {
            playList.splice(fpIndex + 1, 1);
        }
    }

    // 获取当前sequenceList中的索引(要插入的位置)
    let currentSIndex = findIndex(sequenceList, currentSong) + 1;

    let fsIndex = findIndex(sequenceList, song);

    // 插入歌曲
    sequenceList.splice(currentSIndex, 0, song);

    if(fsIndex > -1) {
        if(currentSIndex > fsIndex) {
            sequenceList.splice(fsIndex, 1);
        } else {
            sequenceList.splice(fsIndex + 1, 1);
        }
    }

    commit(types.SET_PLAYLIST, playList);
    commit(types.SET_SEQUENCE_LIST, sequenceList);
    commit(types.SET_CURRENT_INDEX, currentIndex);
    commit(types.SET_FULL_SCREEN, true);
    commit(types.SET_PLAYING_STATE, true);
}






// 保存当前搜索的歌手信息
export const saveSearchHistory = function({commit}, query){
    commit(types.SET_SEARCH_HISTORY, saveSearch(query));
}





// 删除当前搜索歌手信息
export const deleteSearchHistory = function({commit}, query) {
    commit(types.SET_SEARCH_HISTORY, deleteSearch(query));
}





// 清空所有搜索的歌手信息
export const clearSearchHistory = function({commit}) {
    commit(types.SET_SEARCH_HISTORY, clearSearch());
}





// 删除当前歌曲
export const deleteSong = function({commit, state}, song) {
    let playList = state.playList.slice();
    let sequenceList = state.sequenceList.slice();
    let currentIndex = state.currentIndex;
    let pIndex = findIndex(playList, song);
    // 删掉当前歌曲
    playList.splice(pIndex, 1);
    let sIndex = findIndex(sequenceList, song);
    sequenceList.splice(sIndex, 1);

    // 当前播放的歌曲如果在删除的歌曲索引以后，或者是删除的最后一首歌曲，当前歌曲索引要减减
    if(currentIndex > pIndex || currentIndex === playList.length) {
        currentIndex--;
    }

    commit(types.SET_PLAYLIST, playList);
    commit(types.SET_SEQUENCE_LIST, sequenceList);
    commit(types.SET_CURRENT_INDEX, currentIndex);

    // 如果没有歌曲了要把播放状态设为false || // 如果有播放列表就把播放状态设为true
    const playingState = playList.length > 0;
    commit(types.SET_PLAYING_STATE, playingState);
}





 // 清空所有列表数据
export const deleteSongList = function({commit}) {
    commit(types.SET_PLAYLIST, []);
    commit(types.SET_SEQUENCE_LIST, []);
    commit(types.SET_CURRENT_INDEX, -1);
    commit(types.SET_PLAYING_STATE, false);
}






export const savePlayHistory = function({commit}, song) {
    commit(types.SET_PLAY_HISTORY, savePlay(song));
}





// 收藏歌曲
export const saveFavoriteList = function({commit}, song) {
    commit(types.SET_FAVORITE_LIST, saveFavorite(song));
}





// 删除收藏歌曲
export const deleteFavoriteList = function({commit}, song) {
    commit(types.SET_FAVORITE_LIST, deleteFavorite(song));
}