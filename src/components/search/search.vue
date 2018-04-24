<template>
    <div class="search">
        <div class="search-box-wrapper">
            <search-box ref='searchBox' @query='onQueryChange'></search-box>
        </div>
        <div class="shortcut-wrapper" v-show='!query' ref='shortcutWrapper'>
            <scroll class="shortcut" :data='shortcut' :refreshDelay='refreshDelay' ref='shortcut'>
                <!-- 设置两个div的高度所有外层要加一个div包裹 -->
                <div>
                    <div class="hot-key">
                        <h1 class="title">热门搜索</h1>
                        <ul>
                            <li class='item' v-for='item in hotKey' @click='addQuery(item.k)'>
                                <span>{{ item.k }}</span>
                            </li>
                        </ul>
                    </div>
                    <div class="search-history" v-show='this.searchHistory.length'>
                        <h1 class="title">
                            <span class="text">搜索历史</span>
                            <span class="clear" @click='showConfirm'>
                                <i class="icon-clear"></i>
                            </span>
                        </h1>
                        <search-list @select='addQuery' @delete='deleteSearchHistory' :searches='searchHistory'></search-list>
                    </div>
                </div>
            </scroll>
        </div>
        <div class="search-result" v-show='query' ref='searchResult'>
            <suggest :query='query' @select='saveSearch' @listScroll='blurInput' ref='suggest'></suggest>
        </div>
        <confirm ref='confirm' text='是否清空所有搜索历史' @confirm='clearSearchHistory'></confirm>
        <router-view></router-view>
    </div>
</template>

<script>
    import SearchBox from 'base/search-box/search-box';
    import { getHotKey } from 'api/search';
    import { ERR_OK } from 'api/config';
    import Suggest from 'components/suggest/suggest';
    import {mapActions, mapGetters} from 'vuex';
    import SearchList from 'base/search-list/search-list';
    import Confirm from 'base/confirm/confirm';
    import Scroll from 'base/scroll/scroll';
    import {playlistMixin, searchMixin} from 'common/js/mixin'
    export default{
        mixins: [playlistMixin, searchMixin],
        data(){
            return {
                hotKey: []
            }
        },
        created(){
            this._getHotKey();
        },
        computed: {
            shortcut(){
                // 计算 hot-key 和 search-history 两个元素的高度 然后传给srcoll组件
                return this.hotKey.concat(this.searchHistory);
            }
        },
        methods: {
            handlePlatlist(playlist){
                const bottom = playlist.length > 0 ? '60px' : '';
                this.$refs.shortcutWrapper.style.bottom = bottom;
                // 从新计算高度
                this.$refs.shortcut.refresh()

                this.$refs.searchResult.style.bottom = bottom;
                // 从新计算高度
                this.$refs.suggest.refresh();
            },
            showConfirm(){
                this.$refs.confirm.show();
            },
            _getHotKey(){
                getHotKey().then((res) => {
                    if(res.code === ERR_OK){
                        // 截取前10个数据
                        this.hotKey = res.data.hotkey.slice(0, 10);
                    }
                });
            },
            ...mapActions([
                'clearSearchHistory'
            ])
        },
        watch: {
            query(newQuery) {
                // 监听query的变化 如果没有newQuery就刷新一次页面
                if(!newQuery) {
                    
                    setTimeout(() => {
                        this.$refs.shortcut.refresh();
                    }, 20);
                }
            }
        },
        components: {
            SearchBox,
            Suggest,
            SearchList,
            Confirm,
            Scroll
        }
    }
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
  @import "~common/stylus/variable"
  @import "~common/stylus/mixin"

  .search
    .search-box-wrapper
      margin 20px
    .shortcut-wrapper
      position fixed
      top 178px
      bottom 0
      width 100%
      .shortcut
        height 100%
        overflow hidden
        .hot-key
          margin 0px 20px 20px 20px
          .title
            margin-bottom 20px
            font-size $font-size-medium
            color $color-text-l
          .item
            display inline-block
            padding 5px 10px
            margin 0px 20px 10px 0
            border-radius 6px
            background $color-highlight-background
            font-size $font-size-medium
            color $color-text-d
        .search-history
          position relative
          margin 0px 20px
          .title
            display flex
            align-items center
            height 40px
            font-size $font-size-medium
            color $color-text-l
            .text
              flex 1
            .clear
              extend-click()
              .icon-clear
                font-size $font-sieze-medium
                color $color-text-d
    .search-result
      position fixed
      width 100%
      top 178px
      bottom 0
</style>