<template>
    <div class='singer' ref='singer'>
        <list-view @select='selectSinger' :data='singres' ref='list'></list-view>
        <router-view></router-view>
    </div>
</template>

<script>
    import {getSingerList} from 'api/singer';
    import Singer from 'common/js/singer';
    import ListView from 'base/listview/listview';
    import {ERR_OK} from 'api/config';
    import {mapMutations} from 'vuex';
    import {playlistMixin} from 'common/js/mixin';
    const HOT_NAME = '热门';
    const HOT_SINGER_LEN = 10;
    export default{
        mixins: [playlistMixin],
        data(){
            return {
                singres: []
            }
        },
        created(){
            this._gitSingerList();
        },
        methods: {
            selectSinger(singer){
                this.$router.push({
                    path:`/singer/${singer.id}`
                });
                this.setSinger(singer);
            },
            // 设置页面列表的滚动位置
            handlePlatlist(playlist){
                const bottom = playlist.length > 0 ? '60px' : 0;
                // 给列表设置高度
                this.$refs.singer.style.bottom = bottom;
                // 重新计算
                this.$refs.list.refresh();
            },
            _gitSingerList(){
                getSingerList().then((res) => {
                    if(res.code === ERR_OK){
                        this.singres = this._normalizeSinger(res.data.list);
                    }
                });
            },
            _normalizeSinger(list){
                // 热门数据列表
                let map = {
                    hot: {  
                        title: HOT_NAME,
                        items: []
                    }
                }
                list.forEach((item, index) => {
                    // 处理热门数据列表
                    if(index < HOT_SINGER_LEN){
                        map.hot.items.push(new Singer({
                            name: item.Fsinger_name,
                            id: item.Fsinger_mid
                        }));
                    }
                    // 处理歌手列表数据
                    const key = item.Findex;
                    if(!map[key]){
                        map[key] = {
                            title: key,
                            items: []
                        }
                    }
                    map[key].items.push(new Singer({
                        name: item.Fsinger_name,
                        id: item.Fsinger_mid
                    }));
                });
                // 为了得到有序列表，我们需要处理 map
                let hot = []; // 热门数据
                let ret = []; // 歌手数据列表
                for(let key in map){
                    let val = map[key];
                    if(val.title.match(/[a-zA-Z]/)){
                        ret.push(val);
                    } else if(val.title === HOT_NAME){
                        hot.push(val);
                    }
                }
                // 对歌手列表进行排序
                ret.sort((a, b) => {
                    return a.title.charCodeAt(0) - b.title.charCodeAt(0);
                });
                // 把热门数据和歌手数据进行连接返回一个一维数组
                return hot.concat(ret);
            },
            ...mapMutations({
                setSinger: 'SET_SINGER'
            })
        },
        components: {
            ListView
        }
    }
</script>

<style lang="stylus" scoped rel="stylesheet/stylus">
  .singer
    position fixed
    top 88px
    bottom 0
    width 100%
</style>