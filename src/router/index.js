import Vue from "vue";
import VueRouter from "vue-router";
import App from "../App.vue";
import home from "../views/home.vue";
import concernedPoint from "../views/modules/concernedPoint.vue";
import deviceList from "../views/modules/deviceList.vue";
import sceneBrowsing from "../views/modules/sceneBrowsing.vue";
import webEarth from "../views/webEarth.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: App,
    children: [
      {
        //地址为空时跳转home页面
        path: "",
        redirect: "/home"
      },
      {
        path: "/home",
        component: home
      },
      {
        path: "/webEarth",
        component: webEarth
      },
      {
        path: "/sceneBrowsing",
        component: sceneBrowsing
      },
      {
        path: "/concernedPoint",
        component: concernedPoint
      },
      {
        path: "/deviceList",
        component: deviceList
      }
    ]
  }
];

const router = new VueRouter({
  routes
});

export default router;
