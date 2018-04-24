<template>
    <div class="player" v-show='playList.length > 0'>
        <transition name='normal' 
                    @enter='enter' 
                    @after-enter='afterEnter' 
                    @leave='leave'
                    @after-leave='afterLeave'>
            <div class="normal-player" v-show='fullScreen'>
                <div class="background">
                    <img width="100%" height="100%" :src='currentSong.image'>
                </div>
                <div class="top">
                    <div class="back" @click='back'>
                        <i class="icon-back"></i>
                    </div>
                    <h1 class="title" v-html='currentSong.name'></h1>
                    <h2 class="subtitle" v-html='currentSong.senger'></h2>
                </div>
                <div class="middle" 
                    @touchstart.prevent='middleTouchStart'
                    @touchmove.prevent='middleTouchMove'
                    @touchend='middleTouchend'>
                    <div class="middle-l" ref='middleL'>
                        <div class="cd-wrapper" ref='cdWrapper'>
                            <div class="cd" :class='cdCls'>
                                <img class="image" :src='currentSong.image'>
                            </div>
                        </div>
                        <div class='playing-lyric-wrapper'>
                            <div class='playing-lyric'>
                                <!-- 当前播放歌词 -->
                                {{ playingLyric }}
                            </div>
                        </div>
                    </div>
                    <!-- 歌词部分 -->
                    <scroll class="middle-r" ref="lyricList" :data='currentLyric && currentLyric.lines'>
                        <div class="lyric-wrapper">
                          <div v-if="currentLyric">
                                <p  class="text"
                                    :class="{'current': currentLineNum === index}"
                                    v-for="(line, index) in currentLyric.lines"
                                    ref="lyricLine">{{line.txt}}
                                </p>
                          </div>
                        </div>
                    </scroll>
                </div>
                <div class="bottom">
                    <div class="dot-wrapper">
                        <span class="dot" :class="{'active': currentShow === 'cd'}"></span>
                        <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
                    </div>
                    <div class="progress-wrapper">
                        <span class="time time-l">{{format(currentTime)}}</span>
                        <div class="progress-bar-wrapper">
                            <progress-bar :percent='percent' @percentChange='onPeogressBarChange'></progress-bar>
                        </div>
                        <span class="time time-r">{{format(currentSong.duration)}}</span>
                    </div>
                    <div class="operators">
                        <div class="icon i-left" @click='changeMode'>
                            <i :class="iconMode"></i>
                        </div>
                        <div class="icon i-left" :class='disableCls'>
                            <i @click='prev' class="icon-prev"></i>
                        </div>
                        <div class="icon i-center" :class='disableCls'>
                            <i :class='playIcon' @click='togglePlaying'></i>
                        </div>
                        <div class="icon i-right" :class='disableCls'>
                            <i @click='next' class="icon-next"></i>
                        </div>
                        <!-- 收藏歌曲 -->
                        <div class="icon i-right">
                            <i class="icon" :class='favoriteIcon' @click='toggleFavorite(currentSong)'></i>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
        <transition name='mini'>
            <div class="mini-player" v-show='!fullScreen' @click='open'>
                <div class="icon">
                    <div class="imgWrapper">
                        <img :class='cdCls' width="40" height="40" :src='currentSong.image'>
                    </div>
                </div>
                <div class="text">
                    <h2 class="name" v-html='currentSong.name'></h2>
                    <p class="desc" v-html='currentSong.senger'></p>
                </div>
                <div class="control">
                    <progress-circle :radius="radius" :percent='percent' >
                        <!-- @click.stop 阻止事件冒泡 -->
                        <i class='icon-mini' @click.stop='togglePlaying' :class='minIcon'></i>
                    </progress-circle>
                </div>
                <div class="control" @click.stop='showPlayList'>
                    <i class="icon-playlist"></i>
                </div>
            </div>
        </transition>
        <playlist ref='playlist'></playlist>
        <audio 
            ref='audio'
            :src='currentSong.url'
            @playing='ready' 
            @error='error' 
            @timeupdate='updateTime' 
            @ended='end'>
        </audio>    
    </div>
</template>
<script>
    import { mapGetters, mapMutations, mapActions } from 'vuex';
    import Scroll from 'base/scroll/scroll';
    import animations from 'create-keyframe-animation';
    import { prefixStyle } from 'common/js/dom';
    import { playMode } from 'common/js/config';
    import ProgressBar from 'base/progress-bar/progress-bar';
    import ProgressCircle from 'base/progress-circle/progress-circle';
    import Lyric from 'lyric-parser';
    import Playlist from 'components/playlist/playlist';
    import { playerMixin } from 'common/js/mixin';
    
    const transform = prefixStyle('transform');
    const transitionDuration = prefixStyle('transitionDuration');
    const timeExp = /\[(\d{2}):(\d{2}):(\d{2})]/g;
    export default{
        mixins: [playerMixin],
        data(){
            return {
                songReady: false,
                currentTime: 0,
                radius: 0,
                currentLyric: null, // 存储歌词
                currentLineNum: 0, // 当前歌词的行数
                currentShow: 'cd',
                playingLyric: '', // 当前播放歌词
                isPureMusic: false,
                pureMusicLyric: ''
            }
        },
        computed: {
            // normal点击暂停和播放的样式切换
            playIcon(){
                return this.playing ? 'icon-pause' : 'icon-play';
            },
            // mini点击暂停和播放的样式切换
            minIcon(){
                return this.playing ? 'icon-pause-mini' : 'icon-play-mini';
            },
            // 唱片旋转的样式
            cdCls(){
                return this.playing ? 'play' : 'play pause';
            },
            // 网络环境不好的时候，控制播放按钮的样式
            disableCls(){
                return this.songReady ? '' : 'disable';
            },
            // 歌曲当前播放的时间
            percent(){
                return this.currentTime / this.currentSong.duration;
            },
            // 映射vuex中的数据到页面上
            ...mapGetters([
                'fullScreen',
                'playing',
                'currentIndex'
            ])
        },
        created(){
            this.touch = {};
        },
        methods: {
            // 隐藏normal-player播放器
            back(){
                this.setFullScreen(false);
            }, 
            // 显示normal-player播放器
            open(){
                this.setFullScreen(true);
            },
            enter(el, done){
                const {x, y, scale} = this._getPosAndScale();
                let animation = {
                    0: {
                        transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
                    },
                    60: {
                        transform: `translate3d(0,0,0) scale(1.1)`
                    },
                    100: {
                        transform: `translate3d(0,0,0) scale(1)`
                    }
                }
                animations.registerAnimation({
                    name: 'move',
                    animation,
                    presets: {
                        duration: 400,
                        easing: 'linear'
                    }
                })
                animations.runAnimation(this.$refs.cdWrapper, 'move', done);
            },
            afterEnter(){
                animations.unregisterAnimation('move');
                this.$refs.cdWrapper.style.animation = '';
            },
            leave(el, done){
                this.$refs.cdWrapper.style.transition = `all 0.4s`;
                const {x, y, scale} = this._getPosAndScale();
                this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
                this.$refs.cdWrapper.addEventListener('transitionend', done);
            },
            afterLeave(){
                this.$refs.cdWrapper.style.transition = '';
                this.$refs.cdWrapper.style[transform] = '';
            },
            togglePlaying(){
                // 如果songReady为false就不能点击切换歌曲
                if(!this.songReady){
                    return;
                }
                // 切换音乐播放
                this.setPlayingState(!this.playing);
                // 点击暂停歌曲就停止滚动歌词
                if(this.currentLyric){
                    this.currentLyric.togglePlay();
                }
            },
            // 当前歌曲播放完毕的事件
            end(){
                this.currentTime = 0;
                // 判断当前歌曲是不是循环播放
                if(this.mode === playMode.loop){
                    this.loop();
                } else{
                    // 播放下一首歌曲
                    this.next();
                }
            },
            // 歌曲循环播放的操作
            loop(){
                // 把当前歌曲播放的时间设为0
                this.$refs.audio.currentTime = 0;
                // 调用播放方法
                this.$refs.audio.play();
                // 如果当前是循环播放就让歌词从新滚动
                if(this.currentLyric){
                    this.currentLyric.seek(0);
                }
            },
            next(){
                // 如果songReady为false就不能点击切换歌曲
                if(!this.songReady){
                    return;
                }
                // 如果this.playList.length为1 就循环播放
                if(this.playList.length === 1) {
                    this.loop();
                    return;
                } else {
                    let index = this.currentIndex + 1;
                    // 如果播放到最后一首歌的时候，把index设为0，再从第一首开加1进行播放
                    if(index === this.playList.length) {
                        index = 0;
                    }
                    this.setCurrentIndex(index);
                    // 如果为暂停状态，调用togglePlaying方法改变状态
                    if(!this.playing){
                        this.togglePlaying();
                    }
                }    
                this.songReady = false;
            },
            prev(){
                // 如果songReady为false就不能点击切换歌曲
                if(!this.songReady){
                    return;
                }
                // 如果this.playList.length为1 就循环播放
                if(this.playList.length === 1) {
                    this.loop();
                    return;
                } else {
                    let index = this.currentIndex - 1;
                    // 如果播放到第一首歌曲，把index设为所有歌曲的最后索引，进行播放
                    if(index === -1){
                        index = this.playList.length - 1;
                    }
                    this.setCurrentIndex(index);
                    // 如果为暂停状态，调用togglePlaying方法改变状态
                    if(!this.playing){
                        this.togglePlaying();
                    }
                }
            },
            ready(){
                clearTimeout(this.timer);
                this.songReady = true;
                this.canLyricPlay = true;
                // 播放历史
                this.savePlayHistory(this.currentSong);
                // 如果歌曲的播放晚于歌词的出现，播放的时候需要同步歌词
                if (this.currentLyric && !this.isPureMusic) {
                    this.currentLyric.seek(this.currentTime * 1000);
                }
            },
            // 网络错误加载不到歌曲url时候的处理逻辑
            error(){
                clearTimeout(this.timer);
                this.songReady = true;
            },
            updateTime(e){
                // 获取当前歌曲播放时间
                this.currentTime = e.target.currentTime;
            },
            format(interval){
                // 时间取整
                interval = interval | 0;
                // 计算分钟数
                const minute = interval / 60 | 0;
                // 计算秒钟数
                const second = this._pad(interval % 60);
                // 返回计算好的时间
                return `${minute}:${second}`;
            },
            onPeogressBarChange(percent){
                const curretTime = this.currentSong.duration * percent;
                // 设置当前audio的播放时间，利用当前歌曲播放时间决定进度条的位置
                this.$refs.audio.currentTime = curretTime;
                // 如果为暂停状态，调用togglePlaying方法改变状态
                if(!this.playing){
                    this.togglePlaying();
                }
                // 拖动进度条的时候让歌词滚动到相应的位置
                if(this.currentLyric){
                    this.currentLyric.seek(curretTime * 1000);
                }
            },
            // 利用Lyric解析歌词数据
            getLyric(){
                this.currentSong.getLyric().then((lyric) => {
                    // 阻止快速切歌导致歌曲和歌词不一致
                    if (this.currentSong.lyric !== lyric) {
                        return;
                    }
                    this.currentLyric = new Lyric(lyric, this.handLyric);
                    this.isPureMusic = !this.currentLyric.lines.length
                    if (this.isPureMusic) {
                        this.pureMusicLyric = this.currentLyric.lrc.replace(timeExp, '').trim();
                        this.playingLyric = this.pureMusicLyric
                    } else {
                        if (this.playing && this.canLyricPlay) {
                            // 这个时候有可能用户已经播放了歌曲，要切到对应位置
                            this.currentLyric.seek(this.currentTime * 1000)
                        }
                    }
                }).catch(() => {
                    this.currentLyric = null;   
                    this.playingLyric = '';
                    this.currentLineNum = 0;
                })
            },
            // 歌词滚动效果
            handLyric({lineNum, txt}){
                if (!this.$refs.lyricLine) {
                    return;
                }
                this.currentLineNum = lineNum;
                // 如果播放的歌词大于5行开始滚动
                if(lineNum > 5){
                    let lineEl = this.$refs.lyricLine[lineNum - 5];
                    this.$refs.lyricList.scrollToElement(lineEl, 1000);
                } else {
                    // 否则就在顶部
                    this.$refs.lyricList.scrollTo(0, 0, 1000);
                }
                // 显示当前播放的歌词
                this.playingLyric = txt;
            },
            showPlayList() {
                this.$refs.playlist.show();
            },
            middleTouchStart(e){
                this.touch.initiated = true;
                const touch = e.touches[0];
                // 记录点击的坐标
                this.touch.startX = touch.pageX;
                this.touch.startY = touch.pageY;
            },
            middleTouchMove(e){
                if(!this.touch.initiated) {
                    return;
                }
                const touch = e.touches[0];
                const deltaX = touch.pageX - this.touch.startX;
                const deltaY = touch.pageY - this.touch.startY;
                // 如果是纵向滚动就什么都不做直接return
                if(Math.abs(deltaY) > Math.abs(deltaX)) {
                    return;
                }
                const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
                // 计算偏移的宽度
                const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX));
                // 计算偏移的比例
                this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
                // 设置最终的位置
                this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
                this.$refs.lyricList.$el.style[transitionDuration] = 0;
                this.$refs.middleL.style.opacity = 1 - this.touch.percent;
                this.$refs.middleL.style[transitionDuration] = 0;
            },
            middleTouchend(e){
                let offsetWidth;
                let opacity;
                // 从右向左滑动的情况
                if(this.currentShow === 'cd'){
                    if(this.touch.percent > 0.3){
                        offsetWidth = -window.innerWidth;
                        opacity = 0;
                        this.currentShow = 'lyric';
                    } else {
                        offsetWidth = 0;
                        opacity = 1;
                    }
                } else {
                    // 从左向右滑动
                    if(this.touch.percent < 0.7){
                        offsetWidth = 0;
                        opacity = 1;
                        this.currentShow = 'cd';
                    } else {
                        offsetWidth = -window.innerWidth;
                        opacity = 0;
                    }
                }
                const TIME = 500;
                // 设置最终的位置
                this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
                this.$refs.lyricList.$el.style[transitionDuration] = `${TIME}ms`;
                this.$refs.middleL.style.opacity = opacity;
                this.$refs.middleL.style[transitionDuration] = `${TIME}ms`;
            },
            // 秒数添加0补位
            _pad(num, n = 2){
                let len = num.toString().length;
                while(len < n){
                    num = '0' + num;
                    len++;
                }
                return num;
            },
            _getPosAndScale(){
                const targetWidth = 40;
                const paddingLeft = 20;
                const paddingBottom = 10;
                const paddingTop = 80;
                // 获取cd容器的宽度
                const width = window.innerWidth * 0.8;
                // 计算初始缩放比例
                const scale = targetWidth / width;
                const x = -(window.innerWidth / 2 - paddingLeft);
                const y = window.innerHeight - paddingTop - width / 2 - paddingBottom;
                return{
                    x,
                    y,
                    scale
                }
            },
            // 操作vuex中的数据进行页面的改变
            ...mapMutations({
                setFullScreen: 'SET_FULL_SCREEN'
            }),
            ...mapActions([
                'savePlayHistory'
            ])
        },
        watch: {
            currentSong: {
               handler(newSong, oldSong) {
                    // 没有newSong.id 或者 newSong.id和上次播放的歌曲一样
                    if (!newSong.id || newSong.id === oldSong.id) {
                        return;
                    }
                    this.songReady = false;
                    if (this.currentLyric) {
                        this.currentLyric.stop();
                        // 重置为null
                        this.currentLyric = null;
                        this.currentTime = 0;
                        this.playingLyric = '';
                        this.currentLineNum = 0;
                    }
                    clearTimeout(this.timer);
                    this.timer = setTimeout(() => {
                        // 播放歌曲
                        this.$refs.audio.play();
                        // 解析歌词
                        this.getLyric();
                    }, 800);
                 },
                 sync: true
            },
            playing(newPlaying){
                if (!this.songReady) {
                    return;
                }
                const audio = this.$refs.audio;
                this.$nextTick(() => {
                    // pause() 关闭音乐api
                    newPlaying ? audio.play() : audio.pause();
                })
            }
        },
        components: {
            ProgressBar,
            ProgressCircle,
            Scroll,
            Playlist
        }
    }
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background
      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)
      .top
        position: relative
        margin-bottom: 25px
        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50
          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)
        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text
        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text
      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0
        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%
          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%
            box-sizing border-box
            .cd
              width: 100%
              height: 100%
              border-radius: 50%
              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%
                box-sizing border-box
                border: 10px solid rgba(255, 255, 255, 0.1)
              &.play
                animation: rotate 20s linear infinite
              &.pause
                animation-play-state paused  

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center
            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l
        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden
          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center
            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium
              &.current
                color: $color-text
            .pure-music
              padding-top 50%
              line-height 32px
              color $color-text-l
              font-size $font-size-medium
      .bottom
        position: absolute
        bottom: 50px
        width: 100%
        .dot-wrapper
          text-align: center
          font-size: 0
          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l
            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll
        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0
          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px
            &.time-l
              text-align: left
            &.time-r
              text-align: right
          .progress-bar-wrapper
            flex: 1
        .operators
          display: flex
          align-items: center
          .icon
            flex: 1
            color: $color-theme
            &.disable
              color: $color-theme-d
            i
              font-size: 30px
          .i-left
            text-align: right
          .i-center
            padding: 0 20px
            text-align: center
            i
              font-size: 40px
          .i-right
            text-align: left
          .icon-favorite
            color: $color-sub-theme
      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s
        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
      &.normal-enter, &.normal-leave-to
        opacity: 0
        .top
          transform: translate3d(0, -100px, 0)
        .bottom
          transform: translate3d(0, 100px, 0)
    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background
      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s
      &.mini-enter, &.mini-leave-to
        opacity: 0
      .icon
        flex: 0 0 40px
        width: 40px
        height 40px
        padding: 0 10px 0 20px
        .imgWrapper
          height: 100%
          width: 100%
          img
            border-radius: 50%
            &.play
              animation: rotate 10s linear infinite
            &.pause
              animation-play-state: paused
      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden
        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text
        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d
      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px
        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d
        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: -5px

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>