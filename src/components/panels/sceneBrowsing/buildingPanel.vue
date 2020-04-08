<template>
  <div class="cjll-box">
    <span class="box-anglel"></span>
    <span class="box-angler"></span>
    <div class="cjll-div">
      <div class="cjll-list">
        <button class="cjll-item" onclick="require('SceneBrowsing').openBuilding('jail')">
          <div></div>
          <span>看守所</span>
        </button>
        <button class="cjll-item" onclick="require('SceneBrowsing').openBuilding('clinic')">
          <div></div>
          <span>医务室</span>
        </button>
        <button class="cjll-item" onclick="require('SceneBrowsing').locateBuilding('detention', 0)">
          <div></div>
          <span>拘留所</span>
        </button>
        <button class="cjll-item" onclick="require('SceneBrowsing').locateBuilding('supervise', 0)">
          <div></div>
          <span>监管大楼</span>
        </button>
        <button class="cjll-item" onclick="require('SceneBrowsing').locateBuilding('police', 0)">
          <div></div>
          <span>武警营房</span>
        </button>
        <button
          class="cjll-item"
          onclick="require('SceneBrowsing').locateBuilding('meetingroom', 0)"
        >
          <div></div>
          <span>家属会见室</span>
        </button>
      </div>
      <button
        class="cjll-reset"
        onclick="require('reset').revert(); require('SceneBrowsing').loadScenePoi();"
      >
        <div></div>
        <span>还原</span>
      </button>
    </div>
  </div>
</template>