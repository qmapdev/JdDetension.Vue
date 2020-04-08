<template>
  <!--  ****************************************兴趣点列表************************************* -->
  <div class="box-wrap">
    <span class="box-anglel"></span>
    <span class="box-angler"></span>
    <div class="box box-xqd">
      <div class="box-top">
        <div class="box-title">兴趣点列表</div>
        <button class="box-close" onclick="require('ConcernedPoint').hideDiv('left_01');">
          <div></div>
        </button>
      </div>
      <div class="box-xqddiv1">
        <div class="xqd-searchdiv flex">
          <div class="select-parent xqd-select1">
            <button class="select-value" id="BuildingName">建筑</button>
            <input type="hidden" class="hidden" value="建筑" id="BuildingName_hidden" />
            <ul class="select-listul building-ul scrolldiv"></ul>
            <div class="select-ieicon ieicon-1"></div>
          </div>
          <div class="select-parent xqd-select2">
            <button class="select-value" id="Floor">楼层</button>
            <input type="hidden" class="hidden" value="楼层" id="Floor_hidden" />
            <ul class="select-listul floor-ul scrolldiv">
              <!--<li value="1">1楼</li>
              <li value="2">2楼</li>-->
            </ul>
            <div class="select-ieicon ieicon-1"></div>
          </div>
          <button class="new-btn" onclick="showAddPointDiv()" style="margin-left:0.2rem;">
            <div></div>
          </button>
        </div>
        <div class="xqd-newiptdiv addPointDiv" style="display:none;">
          <div class="box-xqddiv2-line1">
            <input placeholder="输入点位名称" id="PointName" />
            <input type="hidden" id="PointID" />
            <input type="hidden" id="Position" />
            <input type="hidden" id="ViewPos" />
          </div>
          <div class="box-xqddiv2-line2 flex">
            <button
              title="坐标和视口确认后请点击完成，若需重新采集，再次点击采集坐标和视口"
              class="xqd-newname setPosBtn"
              style="width:calc(100% - 3.0rem);"
            >点击开始采集坐标和视口</button>
            <button
              class="submit-btn"
              style="position:absolute;right:0.3rem;margin:0;"
              onclick="require('ConcernedPoint').operationPoint();"
            >提交</button>
          </div>
        </div>
      </div>
      <div class="box-xqddiv3">
        <div class="box-listbox xqd-listbox">
          <ul class="box-list scrolldiv" id="ul-concerned" v-if="points.length" type="1">
            <li
              class="list flex"
              v-for="item in points"
              :key="item.PointID"
              style="cursor:pointer;"
            >
              <div class="list-div flex">
                <div class="list-symbol"></div>
                <div class="list-text">
                  <div class="list-name">{{item.PointName}}</div>
                  <div class="list-pos">{{item.Floor}}楼</div>
                </div>
                <div class="list-btnbox flex">
                  <button class="btn btn1">
                    <div></div>
                  </button>
                  <button class="btn btn2">
                    <div></div>
                  </button>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="pagination-box">
          <div class="pagination" id="concerned-pagination"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getPointInfoList } from "../../../services/getData.js";
export default {
  name: "list",  
  data() {
    return {
      points: []
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    async initData() {
      this.points = [];
      let result = await getPointInfoList("", 1, 1, 100);
      console.log(result.data.TotalData);
      this.points = [...result.data.TotalData]; // 如果使用箭头函数，this.points定义undefined错误。
    }
    /**
     * 另一种写法：
     initData: () =>
       getPointInfoList("", 1, 1, 100)
        .then(result => this.points = result.data.TotalData)
        .catch(err => console.log(err)) 
    */
  }
};
</script>