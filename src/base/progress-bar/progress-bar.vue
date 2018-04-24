<template>
    <div class="progress-bar" ref='progressBar' @click='progressClick'>
        <div class="bar-inner">
            <div class="progress" ref='progress'></div>
            <div class="progress-btn-wrapper" 
                ref='progressBtn' 
                @touchstart.prevent='progressTouchStart' 
                @touchmove.prevent='progressTouchMove' 
                @touchend='progressTouchEnd'>
                <div class="progress-btn"></div>
            </div>
        </div>
    </div>
</template>

<script>
    import {prefixStyle} from 'common/js/dom';
    const progressBtnWidth = 16;
    const transform = prefixStyle('transform');
    export default{
        
        props: {
            percent: {
                type: Number,
                default:0
            }
        },
        created(){
            this.touch = {};
        },
        methods: {
            progressTouchStart(e){
                this.touch.initiated = true;
                // 记录点击的位置
                this.touch.startX = e.touches[0].pageX;
                // 记录当前进度条滚动的宽度
                this.touch.left = this.$refs.progress.clientWidth;
            },
            progressTouchMove(e){
                if(!this.touch.initiated) {
                    return;
                }
                // 记录手指移动的偏移量
                const deltaX = e.touches[0].pageX - this.touch.startX;
                // 计算手指移动的当前位置
                const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX));
                this._offset(offsetWidth);
            },
            progressTouchEnd(){
                this.touch.initiated = false;
                this._tringgerPercent();
            },
            // 点击进度条的事件
            progressClick(e){
                // 获取进度条距离左边的像素值
                const rect = this.$refs.progressBar.getBoundingClientRect();
                const offsetWidth = e.pageX - rect.left;
                this._offset(offsetWidth);
                // 当我们点击 progressBtn 的时候 e.offestX获取不对
                // this._offset(e.offsetX);
                this._tringgerPercent();
            },
            _offset(offsetWidth){
                // 设置当前进度条的宽度
                this.$refs.progress.style.width = `${offsetWidth}px`;
                // 设置进度条小球当前的位置
                this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`;
            },
            _tringgerPercent(){
                // 获取进度条的长度
                const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
                // 当前偏移
                const percent = this.$refs.progress.clientWidth / barWidth;
                // 派发事件，告诉外部组件，当前滚动条的偏移量，外部通过当前滚动条的偏移量，计算当前歌曲的播放时间
                this.$emit('percentChange', percent);
            },
        },
        watch: {
            // 根据歌曲播放的时间设置进度条的宽度
            percent(newPercent){
                // && this.touch.initiated 解决在歌曲播放时拖动滚动条时候的抖动
                if(newPercent >= 0 && !this.touch.initiated){
                    // 获取进度条的长度
                    const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
                    // 进度条偏移的比例（偏移的宽度）
                    const offsetWidth = newPercent * barWidth;
                    this._offset(offsetWidth);
                }
            }
        }
    }
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  
  .progress-bar
    height 30px
    .bar-inner
      position relative
      top 13px
      height 4px
      background rgba(0, 0, 0, 0.3)
      .progress
        position absolute
        height 100%
        background $color-theme
      .progress-btn-wrapper
        position absolute
        left -8px
        top -13px
        width 30px
        height 30px
        .progress-btn
          position relative
          top 7px
          left 7px
          box-sizing border-box
          width 16px
          height 16px
          border 3px solid $color-text
          border-radius 50%
          background $color-theme
</style>