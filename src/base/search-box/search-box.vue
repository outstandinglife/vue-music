<template>
    <div class="search-box">
        <i class="icon-search"></i>
        <input type="text" ref='query' class="box" :placeholder='placeholder' v-model='query'/>
        <i class="icon-dismiss" v-show='query' @click='clear'></i>
    </div>
</template>

<script>
    import { debounce } from 'common/js/utli';
    export default{
        props: {
            placeholder: {
                type: String,
                default: '搜索歌曲、歌手'
            }
        },
        data(){
            return {
                query: ''
            }
        },
        created(){
            // 节流操作，控制请求的次数
            this.$watch('query', debounce((newQuery) => {
                this.$emit('query', newQuery);
            }, 200));
        },
        methods: {
            clear(){
                this.query = '';
            },
            // 接收父组件传递的参数，设置搜索框里的内容
            setQuery(query){
                this.query = query;
            },
            blur(){
                this.$refs.query.blur();
            }
        }
    }
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
  @import "~common/stylus/variable"

  .search-box
    display flex
    align-items center
    box-sizing border-box
    width 100%
    padding 0px 6px
    height 40px
    background $color-highlight-background
    border-radius 6px
    .icon-search
      font-size 24px
      color $color-background
    .box
      flex 1
      margin 0px 5px
      line-height 18px
      background $color-highlight-background
      color $color-text
      font-size $font-size-medium
      outline 0
      &::placeholder
        color $color-text-d
    .icon-dismiss
      font-size 15px
      color $color-background
</style>

