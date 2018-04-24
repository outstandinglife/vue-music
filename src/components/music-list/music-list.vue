<template>
    <div class="music-list">
        <div class="back">
            <i class="icon-back" @click='back'></i>
        </div>
        <h1 class="title" v-html='title'></h1>
        <div class="bg-image" :style="bgStyle" ref='bgImage'>
            <div class="play-wrapper">
                <div class="play" v-show='songs.length > 0' ref='playBtn' @click='random'>
                    <i class="icon-play"></i>
                    <span class="text">随机播放全部</span>
                </div>
            </div>
            <div class="filter" ref='filter'></div>
        </div>
        <div class="bg-layer" ref="layer"></div>
        <scroll :data='songs' :listen-scroll='listenScroll' :probe-type='probeType' @scroll='scroll' class='list' ref='list'>
            <div class='song-list-wrapper'>
                <song-list :rank='rank' @select='selectItem' :songs='songs'></song-list>
            </div>
            <div v-show="!songs.length" class="loading-container">
                <loading></loading>
            </div>
        </scroll>
    </div>
</template>

<script>
    import Scroll from 'base/scroll/scroll';
    import SongList from 'base/song-list/song-list';
    import {prefixStyle} from 'common/js/dom';
    import Loading from 'base/loading/loading';
    import { mapActions } from 'vuex';
    import {playlistMixin} from 'common/js/mixin';
    const RESERVED_HEIGHT = 40;
    const transform = prefixStyle('transform');
    const backdrop = prefixStyle('backdrop-filter');
    export default{
        mixins: [playlistMixin],
        props: {
            bgImage: {
                type: String,
                default: ''
            },
            songs: {
                type: Array,
                default: []
            },
            title: {
                type: String,
                default: ''
            },
            rank: {
                type: Boolean,
                default: false
            }
        },
        data(){
            return {
                scrollY: 0
            }
        },
        created(){
            this.probeType = 3;
            this.listenScroll = true;
        },
        mounted(){
            // 记录bgImage的高度
            this.imageHeight = this.$refs.bgImage.clientHeight;
            // 记录可以滚动距离
            this.minTranslateY = -this.imageHeight + RESERVED_HEIGHT;
            this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`;
        },
        computed: {
            bgStyle(){
                return `background-image:url(${this.bgImage})`;
            }
        },
        methods: {
            scroll(pos){
                this.scrollY = pos.y;
            },
            back(){
                this.$router.back();
            },
            selectItem(item, index){
                // 把歌手数据传入vuex中,改变currentSong的状态，在player页面监听进行播放歌曲
                this.selectPlay({
                    list: this.songs,
                    index: index
                });
            },
            // 随机播放歌曲功能
            random(){
                this.randomPlay({
                    list: this.songs
                });
            },
            // 设置页面列表的滚动位置
            handlePlatlist(playlist){
                const bottom = playlist.length > 0 ? '60px' : 0;
                // 给列表设置高度
                this.$refs.list.$el.style.bottom = bottom;
                // 重新计算
                this.$refs.list.refresh();
            },
            ...mapActions([
                'selectPlay',
                'randomPlay'
            ])
        },
        watch: {
            scrollY(newY){
                // layer可以向上滚动的距离
                let tranlateY = Math.max(this.minTranslateY, newY);
                let zIndex = 0;
                let scale = 1;
                let blur = 0;
                const PRECENT = Math.abs(newY / this.imageHeight);
                this.$refs.layer.style[transform] = `translate3d(0, ${tranlateY}px, 0)`;
                if(newY > 0){
                    scale = 1 + PRECENT;
                    zIndex = 10;
                } else {
                    blur = Math.min(20, PRECENT * 20);
                }
                this.$refs.filter.style[backdrop] = `blur(${blur}px)`;
                if(newY < this.minTranslateY){
                    zIndex = 10;
                    this.$refs.bgImage.style.paddingTop = 0;
                    this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`;
                    this.$refs.playBtn.style.display = 'none';
                } else {
                    this.$refs.bgImage.style.paddingTop = '70%';
                    this.$refs.bgImage.style.height = 0;
                    this.$refs.playBtn.style.display = '';
                }
                this.$refs.bgImage.style.zIndex = zIndex;
                this.$refs.bgImage.style[transform] = `scale(${scale})`;
            }
        },
        components: {
            Scroll,
            SongList,
            Loading
        }
    }
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .music-list
    position fixed
    z-index 100
    top 0
    left 0
    bottom 0
    right 0
    background $color-background
    .back
      position absolute
      top 0
      left 6px
      z-index 50
      .icon-back
        display block
        padding 10px
        font-size $font-size-large-x
        color $color-theme
    .title
      position absolute
      top 0
      left 10%
      z-index 40
      width 80%
      no-wrap()
      text-align center
      line-height 40px
      font-size $font-size-large
      color $color-text
    .bg-image
      position relative
      width 100%
      height 0
      padding-top 70%
      transform-origin top
      background-size cover
      .play-wrapper
        position absolute
        bottom 20px
        z-index 50
        width 100%
        .play
          box-sizing border-box
          width 135px
          padding 7px 0
          margin 0 auto
          text-align center
          border 1px solid $color-theme
          color $color-theme
          border-radius 100px
          font-size 0
          .icon-play
            display inline-block
            vertical-align middle
            margin-right 6px
            font-size $font-size-medium-x
          .text
            display inline-block
            vertical-align middle
            font-size $font-size-small
      .filter
        position absolute
        top 0
        left 0
        width 100%
        height 100%
        background rgba(7, 17, 27, 0.4)
    .bg-layer
      position relative
      height 100%
      background $color-background
    .list
      position absolute
      top 0
      bottom 0
      width 100%
      background $color-background
      .song-list-wrapper
        padding 20px 30px
      .loading-container
        position absolute
        width 100%
        top 50%
        transform translateY(-50%)
</style>

