const buildingListData = {
    "462ae5a9-f778-4c66-b4c9-d4aca1fd0a92": { id: '462ae5a9-f778-4c66-b4c9-d4aca1fd0a92', code: 'jail', POIName: 'scenebrowsing_1', Icon: 'Texture/Common/poi-1.png', Position: '13495385.818893,14.699913,-3495928.916183', Text: '看守所', IconSize: [47, 71], callback: "require('SceneBrowsing').loadScenePoiWindow('scenebrowsing_1', '462ae5a9-f778-4c66-b4c9-d4aca1fd0a92')", viewPostion: "13495394.300422666,78.11427307128906,-3496059.49866867", viewAngle: "-154.99998474121094,-0.05118454620242119,-179.9754638671875" },
    "2":{ id: '2', code: 'clinic', POIName: 'scenebrowsing_2', Icon: 'Texture/Common/poi-1.png', Position: '13495466.002823,8.599998,-3495960.187012', Text: '医务室', IconSize: [47,71], callback: "require('SceneBrowsing').loadScenePoiWindow('scenebrowsing_2', 2)", viewPostion:"13495445.720016477,33.91361999511719,-3495998.200813293", viewAngle:"-149.9051055908203,-32.56242752075195,-162.6751708984375"  },
    "3":{ id: '3', code: 'detention', POIName: 'scenebrowsing_3', Icon: 'Texture/Common/poi-1.png', Position: '13495471.614380,8.600014,-3495998.751556', Text: '拘留所', IconSize: [47,71], callback: "require('SceneBrowsing').loadScenePoiWindow('scenebrowsing_3', 3)", viewPostion:"13495429.069381712,41.59934997558594,-3496052.2427062983", viewAngle:"-149.78367614746094,-32.886356353759766,-162.4510498046875"   },
    "4":{ id: '4', code: 'supervise', POIName: 'scenebrowsing_4', Icon: 'Texture/Common/poi-1.png', Position: '13495373.942268,9.499916,-3495986.020340', Text: '监管大楼', IconSize: [47,71], callback: "require('SceneBrowsing').loadScenePoiWindow('scenebrowsing_4', 4)", viewPostion:"13495422.470825193,27.914443969726562,-3495979.7455139155", viewAngle:"-54.98455810546875,58.93516540527344,50.72015380859375"   },
    "5":{ id: '5', code: 'police', POIName: 'scenebrowsing_5', Icon: 'Texture/Common/poi-1.png', Position: '13495434.917105,15.500038,-3496048.775253', Text: '武警营房', IconSize: [47,71], callback: "require('SceneBrowsing').loadScenePoiWindow('scenebrowsing_5', 5)", viewPostion:"13495440.895423887,37.71540832519531,-3495971.5693664546", viewAngle:"-25.324495315551758,8.879511833190918,4.1782050132751465"   },
    "6": { id: '6', code: 'meetingroom', POIName: 'scenebrowsing_6', Icon: 'Texture/Common/poi-1.png', Position: '13495322.301697,4.700020,-3495931.961578', Text: '家属会见室', IconSize: [47, 71], callback: "require('SceneBrowsing').loadScenePoiWindow('scenebrowsing_6', 6)", viewPostion: "13495269.822898862,25.072341918945312,-3495945.6163330073", viewAngle: "-127.23748016357422,-57.94131851196289,-131.88693237304687" },
}

const jailFloorData = {
    1: { id: 1, mainNodeName: "jdkss_1", layerName: "jdkss_1f;jdkss_1f_jiaju;jdkss_1f_shebei;1f_mj;1f_xj;1f_m", individualLayer: "1f_mj;1f_xj;1f_m", floorName: '看守所 1 楼'},
    2: { id: 2, mainNodeName: "jdkss_2", layerName: "jdkss_2f;jdkss_2f_jaiju;jdkss_2f_shebei;2f_mj;2f_xj;2f_m", individualLayer: "2f_mj;2f_xj;2f_m", floorName: '看守所 2 楼'},
    3: { id: 3, mainNodeName: "jdkss_3", layerName: "jdkss_3f;jdkss_3f_jiaju;jdkss_3f_shebei;3f_mj;3f_xj;3f_m", individualLayer: "3f_mj;3f_xj;3f_m", floorName: '看守所 3 楼' },
    4: { id: 4, mainNodeName: "jdkss_jdkss_ding", layerName: "jdkss_ding", individualLayer: "", floorName: '看守所 楼顶' },
}

const clinicFloorData = {
    1: { id: 1, mainNodeName: "juliusuo_1", layerName: "juliusuo_1f;juliusuo_jiaju", individualLayer: "", floorName: '医务室 1 楼'},
    2: { id: 2, mainNodeName: "kss_juliusuo_waike", layerName: "juliusuo_2f", individualLayer: "", floorName: '医务室 2 楼' },
    // 2: { id: 2, mainNodeName: "juliusuo_2", layerName: "juliusuo_2f", floorName: '医务室 2 楼' },
    // 3: { id: 3, mainNodeName: "juliusuo_jiaju", layerName: "juliusuo_jiaju", floorName: '医务室 楼顶' },
}

const deviceLayer = {
    1: { id: 1, floor: "1", floorName: '看守所 1 楼', mj_layer: "1f_mj", xj_layer: "1f_xj", djj_layer: "jdkss_1f_shebei" },
    2: { id: 2, floor: "2", floorName: '看守所 2 楼', mj_layer: "2f_mj", xj_layer: "2f_xj", djj_layer: "jdkss_2f_shebei" },
    3: { id: 3, floor: "3", floorName: '看守所 3 楼', mj_layer: "3f_mj", xj_layer: "3f_xj", djj_layer: "jdkss_3f_shebei" },
}

export {
    buildingListData,
    jailFloorData,
    clinicFloorData,
    deviceLayer
}