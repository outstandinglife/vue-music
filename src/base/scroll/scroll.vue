<template>
    <div ref='wrapper'>
        <slot></slot>
    </div>
</template>

<script>
    import BScroll from 'better-scroll';
    export default{
        props: {
            probeType: {
                type: Number,
                default: 1
            },
            click: {
                type: Boolean,
                default: true
            },
            data: {
                type: Array,
                default: null
            },
            refreshDelay: {
                type: Number,
                default: 20
            },
            // 监听滚动事件
            listenScroll: {
                type: Boolean,
                default: false
            },
            pullup: {
                type: Boolean,
                default: false
            },
            beforeScroll: {
                type: Boolean,
                default: false
            }
        },
        mounted (){
            setTimeout(() => {
                this._initScroll();
            }, 20);
        },
        methods: {
            _initScroll(){
                if(!this.$refs.wrapper){
                    return;
                }
                // 初始化BScroll
                this.scroll = new BScroll(this.$refs.wrapper, {
                    probeType: this.probeType,
                    click: this.click
                });

                // 监听滚动事件
                if(this.listenScroll){
                    let me = this;
                    this.scroll.on('scroll', (pos) => {
                        // 派发scroll事件，传入pos对象
                        me.$emit('scroll', pos);
                    }); 
                }
                // 下拉刷新
                if(this.pullup){
                    this.scroll.on('scrollEnd', () => {
                        if(this.scroll.y <= (this.scroll.maxScrollY + 50)){
                            this.$emit('scrollToEnd');
                        }
                    });
                }

                // 
                if(this.beforeScroll){
                    this.scroll.on('beforeScrollStart', () => {
                        this.$emit('beforeScroll');
                    });
                }
            },
            enable(){
                this.scroll && this.scroll.enable();
            },
            disable(){
                this.scroll && this.scroll.disable();
            },
            refresh(){
                this.scroll && this.scroll.refresh();
            },
            scrollTo(){
                this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
            },
            scrollToElement() {
                this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
            }
        },
        watch: {
            data () {
                // 重新计算高度
                setTimeout(() => {
                    this.refresh();
                }, this.refreshDelay);
            }
        }
    }
</script>