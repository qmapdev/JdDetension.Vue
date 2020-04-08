import {
    getPointInfoList
} from "../services/getData.js";
import {
    GET_CONCERNED_POINT
} from "./mutation.types.js"

export default {
    async getConcernedPoints({
        commit,
        state
    }) {
        let res = await getPointInfoList("", 1, 1, 100);
        commit(GET_CONCERNED_POINT, state, res)
    },
}