<template>
  <div>
    <div class="cesiumViewer" id="cesiumContainer"></div>
    <!-- <el-button class="enter-btn" type="primary">print</el-button> -->
    <el-button class="enter-btn" :type="primay" round :size="medium" @click="flytoDestination">登录</el-button>
  </div>
</template>

<script type="text/javascript">
import {
  Cesium,
  // Cesium3DTileset,
  EllipsoidTerrainProvider,
  // createWorldTerrain,
  // IonResource,
  Viewer,
  Clock,
  WebMapTileServiceImageryProvider,
  createDefaultImageryProviderViewModels,
  Cartesian3,
  // Rectangle,
  UrlTemplateImageryProvider
  // ArcGisMapServerImageryProvider,
  // BingMapsImageryProvider,
  // createTileMapServiceImageryProvider,
  // BingMapsStyle
} from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import Router from "../router/index.js";
//指北针插件
// import CesiumNavigation from "cesium-navigation-es6";
//打印插件
import CesiumPrint from "cesium-print";

let self, viewer;
export default {
  name: "cesiumViewer",
  data() {
    return {
      //   formLabelWidth: "12px",
      //   dialogFormVisible: false,
      //   form: {
      //     fontSize: "32",
      //     width: "978",
      //     height: "650",
      //     // downLoadEnable: true //是否下载打印文件
      //   }
    };
  },
  mounted() {
    self = this;
    self.$notify({
      title: "",
      message: " cesium plugin demo ！",
      type: "success"
    });
    self.init();
  },
  methods: {
    init() {
      viewer = new Viewer("cesiumContainer", {
        animation: false, //是否创建动画小器件，左下角仪表
        baseLayerPicker: false, //是否显示图层选择器
        fullscreenButton: false, //是否显示全屏按钮
        geocoder: false, //是否显示geocoder小器件，右上角查询按钮
        homeButton: false, //是否显示Home按钮
        infoBox: false, //是否显示信息框
        sceneModePicker: false, //是否显示3D/2D选择器
        selectionIndicator: false, //是否显示选取指示器组件
        timeline: false, //是否显示时间轴
        navigationHelpButton: false, //是否显示右上角的帮助按钮
        scene3DOnly: true, //如果设置为true，则所有几何图形以3D模式绘制以节约GPU资源
        clock: new Clock(), //用于控制当前时间的时钟对象
        selectedImageryProviderViewModel: undefined, //当前图像图层的显示模型，仅baseLayerPicker设为true有意义
        // imageryProviderViewModels: createDefaultImageryProviderViewModels(), //可供BaseLayerPicker选择的图像图层ProviderViewModel数组
        selectedTerrainProviderViewModel: undefined, //当前地形图层的显示模型，仅baseLayerPicker设为true有意义
        // terrainProviderViewModels: createDefaultTerrainProviderViewModels(), //可供BaseLayerPicker选择的地形图层ProviderViewModel数组
        terrainProvider: new EllipsoidTerrainProvider(), //地形图层提供者，仅baseLayerPicker设为false有意义
        // skyBox: new Cesium.SkyBox({
        //   sources: {
        //     positiveX: "Cesium-1.7.1/Skybox/px.jpg",
        //     negativeX: "Cesium-1.7.1/Skybox/mx.jpg",
        //     positiveY: "Cesium-1.7.1/Skybox/py.jpg",
        //     negativeY: "Cesium-1.7.1/Skybox/my.jpg",
        //     positiveZ: "Cesium-1.7.1/Skybox/pz.jpg",
        //     negativeZ: "Cesium-1.7.1/Skybox/mz.jpg"
        //   }
        // }), //用于渲染星空的SkyBox对象
        // fullscreenElement: document.body, //全屏时渲染的HTML元素,
        // useDefaultRenderLoop: true, //如果需要控制渲染循环，则设为true
        // targetFrameRate: undefined, //使用默认render loop时的帧率
        // showRenderLoopErrors: false, //如果设为true，将在一个HTML面板中显示错误信息
        // automaticallyTrackDataSourceClocks: true, //自动追踪最近添加的数据源的时钟设置
        contextOptions: {
          id: "cesiumCanvas",
          webgl: {
            preserveDrawingBuffer: true
          }
        } //传递给Scene对象的上下文参数（scene.options）
        // sceneMode: Cesium.SceneMode.SCENE3D, //初始场景模式
        // mapProjection: new Cesium.WebMercatorProjection(), //地图投影体系
        // dataSources: new Cesium.DataSourceCollection()
        //需要进行可视化的数据源的集合
      });
      //使用太阳作为光源，可以照亮地球。
      viewer.scene.globe.enableLighting = true;
      //关闭地面大气效果，（默认为开启状态）
      viewer.scene.globe.showGroundAtmosphere = false;
      //FPS 帧率显示
      viewer.scene.debugShowFramesPerSecond = false;
      //cesiumCanvas id 设置
      viewer.scene.canvas.id = "cesiumCanvas";
      //隐藏cesium logo
      viewer._cesiumWidget._creditContainer.style.display = "none";
      self.flytochina();
      //   //指北针插件
      //   self.initNavigation();
      //初始地图高清
      self.changeBaseMap("tdt");

      viewer.scene.postUpdate.addEventListener(self.icrf());
    },

    icrf(scene, time) {
      if (scene.mode !== Cesium.SceneMode.SCENE3D) {
        return;
      }
      var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
      if (Cesium.defined(icrfToFixed)) {
        var camera = viewer.camera;
        var offset = Cesium.Cartesian3.clone(camera.position);
        var transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
        camera.lookAtTransform(transform, offset);
      }
    },

    /**
     * 中国坐标
     */
    getChinaPostion() {
      return Cartesian3.fromDegrees(116.435314, 40.960521, 17000000.0);
    },
    /**
     *  初始定位中国
     * */
    flytochina() {
      viewer.camera.flyTo({
        destination: self.getChinaPostion(),
        duration: 8
      });
    },

    flytoDestination() {
      viewer.camera.flyTo({
        destination: self.getChinaPostion(),
        duration: 1,
        complete: function() {
          viewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(
              121.46910123,
              31.23688513,
              230000
            ),
            duration: 5,
            complete: function() {
              viewer.camera.flyTo({
                destination: Cartesian3.fromDegrees(
                  121.23256607352765,
                  31.40357199207503,
                  1000.0
                ),
                duration: 4,
                complete: function() {
                  Router.push({ path: "/home" });
                }
              });
            }
          });
        }
      });
      // viewer.camera.flyTo({
      //   destination: Cartesian3.fromDegrees(121.2370084, 31.4016163, 6500.0),
      //   duration: 5,
      //   complete: function() {
      //     viewer.camera.flyTo({
      //       destination: Cartesian3.fromDegrees(
      //         121.23256607352765,
      //         31.40357199207503,
      //         500.0
      //       ),
      //       duration: 5,
      //       complete: function() {
      //         Router.push({ path: "/home" });
      //       }
      //     });
      //   }
      // });

      // var camera = scene.camera;
      // camera.flyTo({
      //     destination : Cartesian3.fromDegrees(-73.98580932617188, 40.74843406689482, 363.34038727246224),
      //     complete : function() {
      //         setTimeout(function() {
      //             camera.flyTo({
      //                 destination : Cartesian3.fromDegrees(-73.98585975679403, 40.75759944127251, 186.50838555841779),
      //                 orientation : {
      //                     heading : Cesium.Math.toRadians(200.0),
      //                     pitch : Cesium.Math.toRadians(-50.0)
      //                 },
      //                 easingFunction : Cesium.EasingFunction.LINEAR_NONE
      //             });
      //         }, 1000);
      //     }
      // });
    },

    /**
     * 切换地图
     */
    changeBaseMap(type) {
      viewer.imageryLayers.removeAll();
      switch (type) {
        case "tdt": //天地图
          viewer.imageryLayers.addImageryProvider(
            new WebMapTileServiceImageryProvider({
              url:
                "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=e378319b5250eff0fdd562f3aa190e62",
              layer: "img",
              style: "default",
              format: "tiles",
              tileMatrixSetID: "w",
              subdomains: ["t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7"],
              maximumLevel: 18,
              show: true
            })
          );
          break;
        case "tdtsl": //天地图矢量
          viewer.imageryLayers.addImageryProvider(
            new WebMapTileServiceImageryProvider({
              url:
                "https://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=93d1fdef41f93d2211deed6d22780c48",
              layer: "tdtVecBasicLayer",
              style: "default",
              format: "image/jpeg",
              tileMatrixSetID: "GoogleMapsCompatible",
              show: false
            })
          );
          break;
        case "gg": //谷歌影像
          var url =
            "https://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali";
          viewer.imageryLayers.addImageryProvider(
            new UrlTemplateImageryProvider({ url: url })
          );
          break;
        case "arcgis": //arcgis
          viewer.imageryLayers.addImageryProvider(
            new ArcGisMapServerImageryProvider({
              url:
                "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
              enablePickFeatures: false
            })
          );
          break;
        case "bing": //必应
          viewer.imageryLayers.addImageryProvider(
            new BingMapsImageryProvider({
              url: "https://dev.virtualearth.net",
              key: "get-yours-at-https://www.bingmapsportal.com/",
              mapStyle: BingMapsStyle.AERIAL
            })
          );
          break;
        case "dark":
          viewer.imageryLayers.addImageryProvider(
            new createTileMapServiceImageryProvider({
              url: "https://cesiumjs.org/blackmarble",
              credit: "Black Marble imagery courtesy NASA Earth Observatory",
              flipXY: true // Only old gdal2tile.py generated tilesets need this flag.
            })
          );
          break;
        case "gd":
          viewer.imageryLayers.addImageryProvider(
            new UrlTemplateImageryProvider({
              url:
                "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}"
            })
          );
      }
      //全球影像中文注记服务
      viewer.imageryLayers.addImageryProvider(
        new WebMapTileServiceImageryProvider({
          url:
            "https://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=93d1fdef41f93d2211deed6d22780c48",
          layer: "tdtAnnoLayer",
          style: "default",
          format: "image/jpeg",
          tileMatrixSetID: "GoogleMapsCompatible",
          show: false
        })
      );
      //全球矢量中文标注服务
      viewer.imageryLayers.addImageryProvider(
        new WebMapTileServiceImageryProvider({
          url:
            "https://t0.tianditu.com/cva_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cva&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=93d1fdef41f93d2211deed6d22780c48",
          layer: "tdtAnnoLayer",
          style: "default",
          format: "image/jpeg",
          tileMatrixSetID: "GoogleMapsCompatible"
        })
      );
    }
  }
};
</script>

<style  scoped>
.cesiumViewer {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  background: #333;
  position: absolute;
  overflow: hidden;
}
.enter-btn {
  position: absolute;
  bottom: 100px;
  right: 100px;
}
</style>