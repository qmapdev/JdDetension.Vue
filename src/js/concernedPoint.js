'use strict'

import {
    getPointInfoList
} from '../services/getData.js'
import q3d_common from '../plugins/q3d_common.js'

/**
 * 创建兴趣点POI
 */
const createPointPois = async () => {
    let result = await getPointInfoList('', 1, 1, 100);
    let data = [...result];
    for (let key in data) {
        let dataPos = await data[key].Position.toGlobalVec3d().toLocalPos("kanshousuo");
        let poiObj = {
            NodePath: "kanshousuo/" + data[key].PointName,
            Position: Q3D.vector3(dataPos),
            Orientation: [0, 0, 0],
            Scale: [1, 1, 1],
            FontColor: "#000000",
            Text: "",
            Icon: 'Texture/common/concernedPoint.png',
            IconSize: [86, 95],
            Location: Q3D.Enums.poiImagePositionType.POI_LOCATE_BOTTOM,
            AlwaysOnScreen: true
        };
        q3d_common.createPOI(poiObj);
    }
}

export {
    createPointPois
}