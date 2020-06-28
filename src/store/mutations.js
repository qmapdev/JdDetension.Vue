import {
  GET_CONCERNED_POINT,
  RECORD_FACEOUT_ACTIVE,
  RECORD_FACEOUT_DISPLAY,
} from "./mutation.types.js";

export default {
  [GET_CONCERNED_POINT](state, info) {
    // if(state.concernedPoints && state.concernedPoints.length > 0){
    //     return;
    // }

    // if(info){
    state.concernedPoints = [...info];
    // }
  },

  [RECORD_FACEOUT_ACTIVE](state, info) {
    state.fadeOutIsActive = info;
  },
  [RECORD_FACEOUT_DISPLAY](state, info) {
    state.fadeOutIsDisplay = info;
  },
};
