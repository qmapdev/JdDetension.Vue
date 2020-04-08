'use strict'

import {
    buildingListData
} from '../data/data.js'
import {
    getPointInfoList
} from '../services/getData.js'

/**
 * 隐藏场景POI
 */
const removeScenePoi = () => {
    const data = buildingListData;
    for (var key in data) {
        var node = Q3D.sceneNode('kanshousuo', data[key].POIName);
        if (node)
            canvasMap.destroySceneNode('kanshousuo', data[key].POIName);
    }
}

/**
 * 隐藏兴趣点POI
 */
const removeConcernedPointPoi = async () => {
    let result = await getPointInfoList('', 1, 1, 100);
    let data = [...result.data.TotalData];
    for (let key in data) {
        var node = Q3D.sceneNode('kanshousuo', data[key].PointName);
        if (node)
            canvasMap.destroySceneNode('kanshousuo', data[key].PointName);
    }
}

export default {
    recovery: () => {
        removeScenePoi();
        removeConcernedPointPoi();
    }
}