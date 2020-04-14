<template>
  <div class="menu-box">
    <ul class="menu-ul">
      <li class="menu-li" id="test01">
        <router-link :to="{path: '/sceneBrowsing'}">
          <button class="menu-circle" data="场景浏览" v-on:click="resetAll">
            <div class="menu-pic"></div>
          </button>
        </router-link>
        <div class="menu-plate"></div>
        <div class="menu-name">场景浏览</div>
        <div class="menu-icon"></div>
        <button class="menu-subbtn">
          <div></div>
        </button>
      </li>
      <li class="menu-li" id="test02">
        <router-link :to="{path: '/deviceList'}">
          <button class="menu-circle" data="设备列表" v-on:click="resetAll">
            <div class="menu-pic"></div>
          </button>
        </router-link>
        <div class="menu-plate"></div>
        <div class="menu-name">设备列表</div>
      </li>
      <li class="menu-li">
        <button class="menu-circle" data="人员定位">
          <div class="menu-pic"></div>
        </button>
        <div class="menu-plate"></div>
        <div class="menu-name">人员定位</div>
      </li>
      <li class="menu-li">
        <router-link :to="{path: '/concernedPoint'}">
          <button class="menu-circle" data="兴趣点" v-on:click="resetAll">
            <div class="menu-pic"></div>
          </button>
          <div class="menu-plate"></div>
          <div class="menu-name">兴趣点</div>
        </router-link>
      </li>
      <li class="menu-li">
          <button class="menu-circle" data="巡视线路">
            <div class="menu-pic"></div>
          </button>
          <div class="menu-plate"></div>
          <div class="menu-name">巡视线路</div>
      </li>
      <li class="menu-li">
        <router-link :to="{path: '/home'}">
          <button class="menu-circle" data="场景还原">
            <div class="menu-pic"></div>
          </button>
          <div class="menu-plate"></div>
          <div class="menu-name">场景还原</div>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import reset from "../../js/reset.js";
export default {
  methods: {
    resetAll: () => {
      reset.recovery();
    }
  }
};
</script>