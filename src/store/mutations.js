import{GET_CONCERNED_POINT} from "./mutation.types.js"

export default{
    [GET_CONCERNED_POINT](state, info){
        // if(state.concernedPoints && state.concernedPoints.length > 0){
        //     return;
        // }

        // if(info){
            state.concernedPoints = [...info];
        // }
    }
}