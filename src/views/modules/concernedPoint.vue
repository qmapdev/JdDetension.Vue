<template>
  <div>
    <list />
  </div>
</template>

<script>
import list from "../../components/panels/concernedPoint/list.vue";
import { createPointPois } from "../../js/concernedPoint.js";

export default {
  name: "concernedPoint",
  components: {
    list
  },
  mounted() {
    createPointPois()
  }, 
  methods: {}
};
</script>