import { mapGetters, mapMutations, mapActions } from 'vuex';
import { playMode } from 'common/js/config';
import { shuffle } from 'common/js/utli';


// 页面底部高度共享代码
export const playlistMixin = {
    computed: {
        ...mapGetters([
            'playList'
        ])
    },
    mounted(){
        this.handlePlatlist(this.playList);
    },
    activated(){
        this.handlePlatlist(this.playList);
    },
    watch: {
        playList(newVal){
            this.handlePlatlist(newVal);
        }
    },
    methods: {
        handlePlatlist() {
            throw new Error('component must implement handlePlaylist method');
        }
    }
}


// 播放模式共享代码
export const playerMixin = {
    computed: {
        // 播放模式的样式
        iconMode(){
            return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random';
        },
        favoriteIcon() {
            return this.getFavoriteIcon(this.currentSong);
        },
        ...mapGetters([
            // 歌曲列表数据
            'sequenceList',
            'currentSong',
            'playList',
            'mode',
            'favoriteList'
        ])
    },
    methods: {
        changeMode(){
            const mode = (this.mode + 1) % 3;
            // 修改播放的mode值
            this.setPlayMode(mode);
            let list = null;
            if(mode === playMode.random) {
                // 随机播放，对数据进行随机排序
                list = shuffle(this.sequenceList);
            } else {
                list = this.sequenceList;
            }
            this.resetCurrentIndex(list);
            // 传入修改状态后的list数据
            this.setPlayList(list);
        },
        resetCurrentIndex(list){
            let index = list.findIndex((item) => {
                // 返回当前播放歌曲的index和this.currentSong相同的id
                return item.id === this.currentSong.id;
            });
            // 设置当前播放歌曲的index值
            this.setCurrentIndex(index);
        },
        getFavoriteIcon(song) {
            if(this.isFavorite(song)) {
                return 'icon-favorite';
            }
            return 'icon-not-favorite';
        },
        toggleFavorite(song) {
            if(this.isFavorite(song)) {
                // 删除当前歌曲
                this.deleteFavoriteList(song);
            } else {
                // 收藏当前歌曲
                this.saveFavoriteList(song);
            }
        },
        isFavorite(song) {
            // 判断
            const index = this.favoriteList.findIndex((item) => {
                return item.id === song.id;
            });
            return index > -1;
        },
        ...mapMutations({
            setPlayingState: 'SET_PLAYING_STATE',
            setCurrentIndex: 'SET_CURRENT_INDEX',
            setPlayMode: 'SET_PLAY_MODE',
            setPlayList: 'SET_PLAYLIST'
        }),
        ...mapActions([
            'saveFavoriteList',
            'deleteFavoriteList'
        ])
    }
}


// 搜索页面的共享代码
export const searchMixin = {
    data() {
        return {
            query: '',
            refreshDelay: 100
        }
    },
    computed: {
        ...mapGetters([
            'searchHistory'
        ])
    },
    methods: {
        onQueryChange(query){
            this.query = query;
        },
        blurInput(){
            this.$refs.searchBox.blur();
        },
        saveSearch(){
            this.saveSearchHistory(this.query);
        },
        addQuery(query){
            // 把页面的内容传入搜索框组件    
            this.$refs.searchBox.setQuery(query);
        },
        ...mapActions([
            'saveSearchHistory',
            'deleteSearchHistory'
        ])
    }
}
