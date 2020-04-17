'use strict'
import q3d_common from '../plugins/q3d_common.js'

/**
 * 摄像机设置到默认地点
 */
const flytoDefaultPos = () => {
    const gc = Q3D.globalCamera();
    const v3d = Q3D.vector3d(13495433.247619627,900,-3495869.161193847);
    const v3 = Q3D.vector3(-80.02993774414062,0.7770623564720154,4.415187358856201);
    gc.flyTo(v3d, v3, 0);
}

/**
 * 摄像机继续飞行，在从地球切换到三维场景后
 */
const keepingFlytoPos = () => {
    const gc = Q3D.globalCamera();
    const v3d = Q3D.vector3d(13495433.247619627,500,-3495869.161193847);
    const v3 = Q3D.vector3(-80.02993774414062,0.7770623564720154,4.415187358856201);
    gc.flyTo(v3d, v3, 2, function(){
        const gc = Q3D.globalCamera();
        const v3d = Q3D.vector3d(13495368.104148862, 70.89649200439453, -3496127.155059814);
        const v3 = Q3D.vector3(-152.14999389648437, -17.266151428222656, -171.08665466308594);
        gc.flyTo(v3d, v3, 2)
    });
}

export {
    flytoDefaultPos,
    keepingFlytoPos
}