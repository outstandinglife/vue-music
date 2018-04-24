// import vConsole from 'vconsole';
import 'babel-polyfill';
import fastclick from 'fastclick';
import Vue from 'vue';
import App from './App';
import router from './router';
import VueLazyload from 'vue-lazyload';
import store from './store';
import 'common/stylus/index.styl';
import vueg from 'vueg'    
import 'vueg/css/transition-min.css'
Vue.use(vueg, router)
// 解决移动端点击事件300毫米延时
fastclick.attach(document.body);

// 图片懒加载
Vue.use(VueLazyload, {
    // 默认加载图片
    loading: require('./common/image/default.png')
})

// router.beforeEach((to, form, next) => {
//     const nextRoute = [ 'recommend', 'order', 'course'];
//     if (nextRoute.indexOf(to.name) >= 0) {  
//         router.push({name:'rank'})
//     }
//     next()
// })

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
