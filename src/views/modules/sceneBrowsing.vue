<template>
  <div>
    <buildingPanel />
    <buildingPoi />
  </div>
</template>

<script>
import buildingPanel from "../../components/panels/sceneBrowsing/buildingPanel.vue";
import buildingPoi from "../../components/panels/sceneBrowsing/buildingPoi.vue";

import {
  createPois,
  startNodeFlollowing,
  createPoisOnMap
} from "../../js/sceneBrowsing.js";

export default {
  name: "sceneBrowsing",
  components: {
    buildingPanel,
    buildingPoi
  },
  mounted() {
    createPoisOnMap();
  },
  methods: {}
};
</script>