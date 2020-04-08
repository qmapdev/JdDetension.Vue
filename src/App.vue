<template>
  <div id="app">
    <Home />
    <router-view />
  </div>
</template>

<script>
import Home from "./views/home.vue";

export default {
  name: "App",
  components: {
    Home
  }
};
</script>
 
<style lang='css'>
@import "./style/style.css";
@import "./style/common.css";
</style>