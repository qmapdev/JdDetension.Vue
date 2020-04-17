<template>
  <div>
    <div class="header">
      <div class="header-titlediv">
        <div class="header-title">监所三维管控平台(Chrome版)</div>
      </div>
      <div class="header-leftdiv">
        <div class="header-hour fl" id="pj-hour">12:10:20</div>
        <div class="header-time fl">
          <div class="header-date" id="pj-date">2019/07/11</div>
          <div class="header-day" id="pj-week">星期三</div>
        </div>
      </div>
      <div class="header-right flex">
        <button class="header-admin flex">
          <div class="admin-pic"></div>
          <div class="admin-name">admin</div>
        </button>
        <router-link :to="{ path: '/webEarth' }">
          <button class="header-cancel" @click="flytoPos">
            <div></div>
          </button>
        </router-link>
      </div>
    </div>

    <div class="divbox flex" style="display: none">
      <div class="divbox-item">
        <div>682</div>
        <span>当前收押</span>
      </div>
      <div class="divbox-item">
        <div>82</div>
        <span>全景视角</span>
      </div>
      <div class="divbox-item">
        <div>56</div>
        <span>当日收押</span>
      </div>
      <div class="divbox-item">
        <div>52</div>
        <span>当日释放</span>
      </div>
    </div>
  </div>
</template>

<script>
import { flytoDefaultPos, keepingFlytoPos } from "../../js/header.js";
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  data() {
    return {};
  },
  mounted() {
    keepingFlytoPos();
  },
  computed: {
    ...mapState(["concernedPoints", "fadeOutIsActive"]),
  },
  methods: {
    // ...mapActions(["getConcernedPoints",""]),
    ...mapMutations(["RECORD_FACEOUT_ACTIVE"]),
    flytoPos: function() {
      this.RECORD_FACEOUT_ACTIVE(false);
      flytoDefaultPos();
    },
  },
};
</script>
