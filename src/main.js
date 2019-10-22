// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// 后添加start
import axios from 'axios'
import VueAxios from 'vue-axios'
import Vue from 'vue'
import App from './App'
import router from './router'
import qs from 'qs'
Vue.prototype.$qs = qs

Vue.prototype.$axios = axios
Vue.use(VueAxios, axios)
axios.defaults.baseURL = 'http://10.10.221.173:8892'
// import axios from 'axios';

// 后添加end
// vue.prototype.$axios = axios
Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'

})
