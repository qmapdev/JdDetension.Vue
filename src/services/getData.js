'use strict'

import axios from 'axios'

/**
 * 获取兴趣点列表
 */
let getPointInfoList = (BuildingName, floor, pageIndex, pageSize) => {
  return new Promise((resovle, reject) => {
    axios.post('/api/JdDetension/ConcernedPoint/GetPointInfoList', {
        BuildingName: BuildingName,
        Floor: floor,
        pageIndex: pageIndex,
        pageSize: pageSize
      })
      .then(function (response) {
        resovle(response);
      })
      .catch(function (error) {
        reject(error);
      });
  })
}

export {
  getPointInfoList
}