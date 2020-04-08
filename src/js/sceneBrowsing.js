"use strict";

import {
    buildingListData
} from "../data/data.js";
import q3d_common from "../plugins/q3d_common.js";

// let createPois = async function () {
//     var data = buildingListData;

//     for (var key in data) {
//         var dataPos = await data[key].Position.toVector3d().toLocalPos('kanshousuo');
//         var poiObj = {
//             NodePath: 'kanshousuo/' + data[key].POIName,
//             Position: Q3D.vector3(dataPos),
//             Orientation: [0, 0, 0],
//             Scale: [1, 1, 1],
//             FontColor: data[key].FontColor == null ? "#000000" : data[key].FontColor,
//             Text: '',
//             Icon: data[key].Icon,
//             IconSize: data[key].IconSize == null ? [50, 50] : data[key].IconSize,
//             Location: Q3D.Enums.poiImagePositionType.POI_LOCATE_BOTTOM,
//             AlwaysOnScreen: true
//         }
//         q3d_common.createPOI(poiObj);
//     }
// }

/**
 * 创建场景POI
 */
const createPois = function () {
    return new Promise(
        async () => {
            const data = buildingListData;
            for (let key in data) {
                let dataPos = await data[key].Position.toVector3d().toLocalPos("kanshousuo");
                let poiObj = {
                    NodePath: "kanshousuo/" + data[key].POIName,
                    Position: Q3D.vector3(dataPos),
                    Orientation: [0, 0, 0],
                    Scale: [1, 1, 1],
                    FontColor: data[key].FontColor == null ? "#000000" : data[key].FontColor,
                    Text: "",
                    Icon: data[key].Icon,
                    IconSize: data[key].IconSize == null ? [50, 50] : data[key].IconSize,
                    Location: Q3D.Enums.poiImagePositionType.POI_LOCATE_BOTTOM,
                    AlwaysOnScreen: true
                };
                q3d_common.createPOI(poiObj);
            }
        }
    );
};

let startNodeFlollowing = function () {
    return new Promise(() =>
        addNodeFollowing("kanshousuo/scenebrowsing_1", "building_1")
    );
};

let nodeFollowingPath = [];
let addNodeFollowing = function (nodePath, domWinName, autoScale) {
    if (autoScale == null) autoScale = true;

    var nodeObject = {
        nodePath: nodePath,
        nodeDom: domWinName
    };

    nodeFollowingPath.push(nodeObject);

    canvasMap.enableNodeFollowing(nodePath, function (node) {
        nodeFolowing(node, autoScale);
    });
};

/**
 * POI窗口节点跟随功能
 */
let nodeFolowing = function (node, autoScale) {
    nodeFollowingPath.forEach(function (e) {
        if (node.name == e.nodePath) {
            if (e.nodeDom.indexOf("building_") > -1) {
                document.getElementById(e.nodeDom).style.left =
                    node.screenX + 15 + "px";
                document.getElementById(e.nodeDom).style.top = node.screenY - 65 + "px";
            } else {
                document.getElementById(e.nodeDom).style.left = node.screenX + "px";
                document.getElementById(e.nodeDom).style.top = node.screenY - 63 + "px";

                if (autoScale) {}
            }
        }
    });
};

/**
 * promise 顺序执行
 */
let createPoisOnMap = () => {
    var res=[];
    // 构建队列
    function queue(arr) {
      var sequence = Promise.resolve();
      arr.forEach(function (item) {
        sequence = sequence.then(item).then(data=>{
            res.push(data);
            return res
        })
      })
      return sequence
    }

    // 执行队列
    queue([createPois,startNodeFlollowing]).then(data=>{
        console.log(data)
    })
    .then(data => {
        console.log(data)
    })
    .catch(e => console.log(e));

    setTimeout(()=>startNodeFlollowing(), 2000)

}

export {
    createPois,
    startNodeFlollowing,
    createPoisOnMap
};