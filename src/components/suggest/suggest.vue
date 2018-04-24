<template>
    <scroll class="suggest" 
            :data='result' 
            :pullup='pullup' 
            @scrollToEnd='searchMore'
            :beforeScroll='beforeScroll'
            ref='suggest' 
            @beforeScroll='listScroll'>
        <ul class="suggest-list">
            <li class="suggest-item" v-for='item in result' @click='selectItem(item)'>
                <div class="icon">
                    <i :class='getIconCls(item)'></i>
                </div>
                <div class="name">
                    <p class="text" v-html='getDisplayName(item)'></p>
                </div>
            </li>
            <loading v-show='hasMore' title=''></loading>
        </ul>
        <div class="no-result-wrapper" v-show='!hasMore && !result.length'>
            <no-result title='抱歉，暂无搜索结果'></no-result>
        </div>
    </scroll>
</template>

<script>
    import { search } from 'api/search';
    import { ERR_OK } from 'api/config';
    import { createSong } from 'common/js/song';
    import Scroll from 'base/scroll/scroll';
    import Loading from 'base/loading/loading';
    import Singer from 'common/js/singer';
    import { mapActions, mapMutations } from 'vuex';
    import NoResult from 'base/no-result/no-result';

    const perpage = 20;
    const TYPE_SINGER = 'singer';
    export default{
        props: {
            query: {
                type: String,
                default: ''
            },
            // 显示歌手信息
            showSinger: {
                type: Boolean,
                default: true
            }
        },
        data(){
            return {
                page: 1,
                result: [],
                pullup: true,
                hasMore: true, // 判断是否下拉刷新
                beforeScroll: true
            }
        },  
        methods: {
            search(){
                // query改变的时候，要把page改成1
                this.page = 1;
                this.hasMore = true;
                // 重置scroll的高度
                this.$refs.suggest.scrollTo(0, 0);
                // 请求数据
                search(this.query, this.page, this.showSinger, perpage).then((res) => {
                    if(res.code === ERR_OK){
                        this.result = this._genResult(res.data);
                        this._checkMore(res.data);
                    }
                })
            },
            getIconCls(item){
                // item.type === 'singer' 就表示当前是歌手信息
                if(item.type === TYPE_SINGER) {
                    return 'icon-mine';
                } else {
                    return 'icon-music';
                }
            },
            getDisplayName(item){
                if(item.type === TYPE_SINGER) {
                    return item.singername;
                } else {
                    return `${item.name}-${item.singer}`;
                }
            },
            searchMore(){
                if(!this.hasMore) {
                    return;
                }
                this.page++;
                // 请求第二页的数据
                search(this.query, this.page, this.showSinger, perpage).then((res) => {
                    if(res.code === ERR_OK){
                        // 把上一次的数据和当前请求的数据进行拼接
                        this.result = this.result.concat(this._genResult(res.data));
                        this._checkMore(res.data);
                    }
                })
            },
            selectItem(item){
                // 实现歌手的点击跳转页面
                if(item.type === TYPE_SINGER) {
                    const singer = new Singer({
                        id: item.singermid,
                        name: item.singername
                    });
                    this.$router.push({
                        path: `/search/${singer.id}`
                    });
                    // 把singer数据写到 vuex 中的 state中
                    this.setSinger(singer);
                } else {
                    // 点击歌曲实现的逻辑
                    this.insertSong(item);
                }

                // 派发事件有外部组件调用
                this.$emit('select');

            },
            refresh(){
                // 代理refresh方法
                this.$refs.suggest.refresh();
            },
            listScroll(){
                this.$emit('listScroll');
            },
            _genResult(data){
                let ret = [];
                if(data.zhida && data.zhida.singerid){
                    ret.push({...data.zhida, ...{type: TYPE_SINGER}});
                }
                if(data.song){
                    ret = ret.concat(this._normalizeSongs(data.song.list));
                }
                return ret;
            },
            _normalizeSongs(list){
                let ret = [];
                list.forEach((musicData) => {
                    if(musicData.songid && musicData.albumid) {
                        ret.push(createSong(musicData));
                    }
                });
                return ret;
            },
            _checkMore(data){
                const song = data.song;
                // 判断是否还有数据
                if(!song.list.length || (song.curnum + song.curpage * perpage) >= song.totalnum) {
                    // 停止下拉刷新
                    this.hasMore = false;
                }
            },
            ...mapMutations({
                setSinger: 'SET_SINGER'
            }),
            ...mapActions([
                'insertSong'
            ])
        },
        watch: {
            // 输入框里的内容变化的时候即请求数据
            query(){
                this.search();
            }
        },
        components: {
            Scroll,
            Loading,
            NoResult
        }
    }
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .suggest
    height 100%
    overflow hidden
    .suggest-list
      padding 0px 30px
      .suggest-item
        display flex
        align-items center
        padding-bottom 20px
      .icon
        flex 0 0 30px
        width 30px
        [class^="icon-"]
          font-size 14px
          color $color-text-d
      .name
        flex 1
        font-size $font-size-medium
        color $color-text-d
        overflow hidden
        .text
          no-wrap()
    .no-result-wrapper
      position absolute
      width 100%
      top 50%
      transform translateY(-50%)
</style>

