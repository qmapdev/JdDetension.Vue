import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import qmap3d from './plugins/q3d-src'
import ElementUI from 'element-ui';

Vue.config.productionTip = false
Vue.use(ElementUI)

new Vue({
  router,
  store,
  qmap3d,
  render: h => h(App)
}).$mount('#app')
