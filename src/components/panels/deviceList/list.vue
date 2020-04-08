<template>
  <!--  ****************************************兴趣点列表************************************* -->
  <div class="box-wrap">
    <span class="box-anglel"></span>
    <span class="box-angler"></span>
    <div class="box box-sblb">
      <div class="box-top">
        <div class="box-title">设备列表</div>
        <button class="box-close" onclick="javascript:$('#left_01').html('');">
          <div></div>
        </button>
      </div>
      <div class="box-sblbdiv0">
        <div class="sblb-ttabbox">
          <div class="sblb-ttab sblb-ttab-left" value="entrance">
            <div class="sblb-ttab-icon"></div>
            <div class="sblb-ttab-name">门禁</div>
            <div class="sblb-ttab-pic"></div>
          </div>
          <div class="sblb-ttab sblb-ttab-center" value="camera">
            <div class="sblb-ttab-icon"></div>
            <div class="sblb-ttab-name">摄像头</div>
            <div class="sblb-ttab-pic"></div>
          </div>
          <div class="sblb-ttab sblb-ttab-right" value="call">
            <div class="sblb-ttab-icon"></div>
            <div class="sblb-ttab-name">对讲机</div>
            <div class="sblb-ttab-pic"></div>
          </div>
        </div>
      </div>
      <div class="box-sblbdiv1 flex">
        <div class="select-parent sblb-select1">
          <button class="select-value">建筑</button>
          <input
            type="hidden"
            class="hidden"
            value="462ae5a9-f778-4c66-b4c9-d4aca1fd0a92"
            id="BuildingName_hidden"
          />
          <ul class="select-listul building-ul scrolldiv"></ul>
          <div class="select-ieicon ieicon-1"></div>
        </div>
        <div class="select-parent sblb-select2">
          <button class="select-value">楼层</button>
          <input type="hidden" class="hidden" value="楼层" id="Floor_hidden" />
          <ul class="select-listul floor-ul scrolldiv" style="overflow-x:hidden;">
            <!--<li value="">楼层</li>
            <li value="1">楼层1</li>-->
          </ul>
          <div class="select-ieicon ieicon-1"></div>
        </div>
        <div class="select-parent sblb-select3">
          <button class="select-value">名称</button>
          <ul class="select-listul">
            <li>名称</li>
            <li>名称1</li>
          </ul>
          <div class="select-ieicon ieicon-1"></div>
        </div>
        <!--<button class="search-btn"><img src="Content/images/icon-5.png" /></button>-->
        <button class="search-btn" onclick="searchDevice();">
          <div></div>
        </button>
      </div>
      <div class="box-sblbdiv2">
        <div class="box-listbox">
          <ul class="box-list scrolldiv" id="device_ul">
            <!--<li class="list flex active">
                        <div class="list-div flex">
                            <div class="list-symbol"></div>
                            <div class="list-text">
                                <div class="list-name">摄像头001 <span>离线</span></div>
                                <div class="list-pos">行政楼二楼1032室门口</div>
                            </div>
                        </div>
                    </li>
                    <li class="list flex ">
                        <div class="list-div flex">
                            <div class="list-symbol"></div>
                            <div class="list-text">
                                <div class="list-name">摄像头001 <span>离线</span></div>
                                <div class="list-pos">行政楼二楼1032室门口</div>
                            </div>
                        </div>
                    </li>
                    <li class="list flex online">
                        <div class="list-div flex">
                            <div class="list-symbol"></div>
                            <div class="list-text">
                                <div class="list-name">摄像头001 <span>在线</span></div>
                                <div class="list-pos">行政楼二楼1032室门口</div>
                            </div>
                        </div>
            </li>-->
          </ul>
        </div>
        <div class="pagination-box">
          <div class="pagination" id="div-pagisnation">
            <span class="current prev">上一页</span>
            <span class="current">1</span>
            <a style="cursor:pointer;">2</a>
            <a style="cursor:pointer;">...</a>
            <a style="cursor:pointer;">4</a>
            <a style="cursor:pointer;" class="next">下一页</a>
          </div>
        </div>
        <div class="sblb-btnbox flex">
          <button>在线设备</button>
          <button>离线设备</button>
        </div>
      </div>
    </div>
  </div>
</template>