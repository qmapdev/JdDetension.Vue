<template>
  <div>
    <div class="pagination-box">
          <div class="pagination" id="div-pagisnation">
            <span class="current prev">上一页</span>
            <span class="current">1</span>
            <a style="cursor:pointer;">2</a>
            <a style="cursor:pointer;">...</a>
            <a style="cursor:pointer;">4</a>
            <a style="cursor:pointer;" class="next">下一页</a>
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
