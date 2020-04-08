import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import qmap3d from './plugins/q3d-src'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  qmap3d,
  render: h => h(App)
}).$mount('#app')
