<template>
  <div>
    <Header />
    <Footer />
    <Menu />
    <div id="cover" v-bind:class="['FadeOutFrame', { 'fadeout': this.isActive }]"></div>
        <!-- <div id="cover" v-bind:class="classObject"></div> -->
  </div>
</template>

<script>
import Header from "../components/common/header.vue";
import Footer from "../components/common/footer.vue";
import Menu from "../components/common/menu.vue";
import { mapState, mapMutations } from "vuex";

export default {
  name: "Home",
  components: {
    Header,
    Footer,
    Menu
  },
  data() {
    return {
      isActive: false,
      classObject: {
        'FadeOutFrame': true,
        'fadeout': this.isActive
      }
    };
  },
  mounted() {
    this.fadeoutLay();
  },
  computed: {
    ...mapState(["fadeOutIsActive"])
  },
  methods: {
    ...mapMutations(["RECORD_FACEOUT_Active"]),
    fadeoutLay: function() {
      this.RECORD_FACEOUT_Active(true);
      this.isActive = this.fadeOutIsActive;
    }
  }
};
</script>

<style scoped>
.overlay {
  background: #000;
  position: absolute;
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  filter: alpha(opacity=30);
  opacity: 0.3;
  display: none;
  z-index: 2;
}

.FadeOutFrame {
  left: 0px;
  top: 0px;
  width: 100%;
  height: 100%;
  background-color: #000;
  /* border: 1px solid #0067aa; */
  position: absolute;
  opacity: 0.5;
  /* z-index: 2; */
    -webkit-transition: all 3s;
  -moz-transition: all 3s;
  -ms-transition: all 3s;
  -o-transition: all 3s;
  transition: all 3s;
}

.FadeOutFrame.fadeout {

  opacity: 0;
  /* display: none; */
}

.FadeInFrame {
  width: 320px;
  height: 180px;
  background-color: #ffd3d3;
  border: 1px solid #b50042;
  opacity: 0;
}

.FadeInFrame.fadein {
  -webkit-transition: all 1.5s;
  -moz-transition: all 1.5s;
  -ms-transition: all 1.5s;
  -o-transition: all 1.5s;
  transition: all 1.5s;
  opacity: 1;
}
</style>
