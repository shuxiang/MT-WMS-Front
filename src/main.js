import Vue from 'vue';
import Antd from 'ant-design-vue';
import App from './App';
// import 'ant-design-vue/dist/antd.css';
// import 'ant-design-vue/dist/antd.less'
import './assets/theme.less'
Vue.config.productionTip = false;
Vue.use(Antd);

// moment
import moment from 'moment'//导入文件
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
Vue.prototype.$moment = moment;//赋值使用

import router from './router'
import axios from 'axios'
/* Vue.prototype.$http = axios */
// var baseURL = process.env.API_ROOT
var env = 'dev'
var baseURL = ''
if (env == 'dev'){
  baseURL = 'http://127.0.0.1:5002'
}
var headers = {}
var http = axios.create({
    baseURL: baseURL,
    timeout: 50000,
    // headers:{'Authorization':'true'}
    headers: headers,
    withCredentials: true,
})
Vue.prototype.$http = http

import store from './store/store'
store.baseURL = baseURL


/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

// Vue.directive('focus', function (el) {
//   el.querySelector('input').focus()
// })

// 金钱格式化
Vue.prototype.mfmt = function(n, c, d, t){
  var s, i, j;
    c = isNaN(c = Math.abs(c)) ? 2 : c, 
    d = d == undefined ? "." : d, 
    t = t == undefined ? "," : t, 
    s = n < 0 ? "-" : "", 
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))), 
    j = (j = i.length) > 3 ? j % 3 : 0;
  return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
}
// 中文格式化日期
Vue.prototype.date_fmt = function(d){
  if(d){
    var ds = d.split(' ')[0].split('-')
    return ds[0]+'年'+ds[1]+'月'+ds[2]+'日'
  }
  return ''
}
// 弹出框大小适应
Vue.prototype.dlgfit = function(x){ // 1200
  var width = document.body.clientWidth
  if (width > 1300){
    return x
  }else if(width >= 1024 && width < 1300 && x >= 1000){
    return 1000
  }else if(width <= 1024 && x >= 800){
    return 800
  }
  return x
}

