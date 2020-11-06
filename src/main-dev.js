import Vue from 'vue'
import App from './App.vue'
import router from './router/index.js'
import './plugins/element.js'
//导入字体图标
import './assets/fonts/iconfont.css'
//导入全局样式
import './assets/css/global.css'
// 导入TreeTable组件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme


// 导入Nprogress对应的css和js  为项目设置加载进度条
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'

//导入axios
import axios from 'axios'


// 配置请求的跟路径
axios.defaults.baseURL = 'http://49.232.150.229:8886/api/private/v1/'
    // 在 request拦截器中，展示进度条 Nprogress.start()
axios.interceptors.request.use(config => {
        // console.log(config);
        Nprogress.start()
        config.headers.Authorization = window.sessionStorage.getItem('token')
            // 在最后必须return config
        return config;
    })
    // 在response拦截器中隐藏进度条 Nprogress.done()
axios.interceptors.response.use(config => {
    Nprogress.done()
    return config
})
Vue.prototype.$http = axios

// 注册为全局可用的组件
Vue.component('tree-table', TreeTable)
Vue.config.productionTip = false;
// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

// 定义全局过滤器
Vue.filter('dataFormat', function(originVal) {
    const dt = new Date(originVal)

    // padStart 不足两位时用0来补
    const y = (dt.getFullYear() + 50)
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + '').padStart(2, '0')

    const hh = (dt.getHours() + '').padStart(2, '0')
    const mm = (dt.getMinutes() + '').padStart(2, '0')
    const ss = (dt.getSeconds() + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`

})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');