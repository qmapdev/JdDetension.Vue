export default  {
    dataCache: {
        currStatus: 1,//0白天 1黑夜
    },
    extend: function () {
        // 默认不进行深拷贝
        var deep = false;
        var name, options, src, copy, clone, copyIsArray;
        var length = arguments.length;
        // 记录要复制的对象的下标
        var i = 1;
        // 第一个参数不传布尔值的情况下，target 默认是第一个参数
        var target = arguments[0] || {};
        // 如果第一个参数是布尔值，第二个参数是 target
        if (typeof target == 'boolean') {
            deep = target;
            target = arguments[i] || {};
            i++;
        }
        // 如果target不是对象，我们是无法进行复制的，所以设为 {}
        if (typeof target !== "object" && !isFunction(target)) {
            target = {};
        }

        // 循环遍历要复制的对象们
        for (; i < length; i++) {
            // 获取当前对象
            options = arguments[i];
            // 要求不能为空 避免 extend(a,,b) 这种情况
            if (options != null) {
                for (name in options) {
                    // 目标属性值
                    src = target[name];
                    // 要复制的对象的属性值
                    copy = options[name];

                    // 解决循环引用
                    if (target === copy) {
                        continue;
                    }

                    // 要递归的对象必须是 plainObject 或者数组
                    if (deep && copy && (isPlainObject(copy) ||
                            (copyIsArray = Array.isArray(copy)))) {
                        // 要复制的对象属性值类型需要与目标属性值相同
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && Array.isArray(src) ? src : [];

                        } else {
                            clone = src && isPlainObject(src) ? src : {};
                        }

                        target[name] = extend(deep, clone, copy);

                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }

        return target;
    },
    //创建POI
    /**
        var poiObj = {
            NodePath: "XHQ/poi1",
            Position: "-44.9198,18.5,0.1903".toVector3(),
            Orientation: [0, 0, 0],
            Scale: [1, 1, 1],
            FontColor: "#00caca",
            Text: "POI测试1",
            Icon: "Texture/dx_dz_16.png",
            IconSize: [50, 50],
            Location: Q3D.Enums.poiImagePositionType.POI_LOCATE_BOTTOM,
            AlwaysOnScreen: true
        }
    **/
    createPOI: function (data) {
        var nodePath = data.NodePath;

        var position = data.Position;
        var orientation = data.Orientation == null ? null : Q3D.vector3(data.Orientation);
        var orientationType = data.OrientationType == null ? Q3D.Enums.nodeOrientationType.Self: data.OrientationType;
        var scale = data.Scale == null ? null : Q3D.vector3(data.Scale);

        var fontSize = data.FontSize == null ? 20 : data.FontSize;
        var fontName = data.FontName == null ? "宋体" : data.FontName;
        var fontColor = data.FontColor == null ? Q3D.colourValue("#000000", 1) : Q3D.colourValue(data.FontColor, 1);
        var charScale = data.CharScale == null ? 1.0 : data.CharScale;
        var text = data.Text;
        var icon = data.Icon;
        var iconSize = data.IconSize == null ? null : Q3D.vector2(data.IconSize);

        var pOILayout = data.POILayout == null ? Q3D.Enums.poiLayOut.Left: data.POILayout;
        var pOILayoutCustom = data.POILayoutCustom;
        var uIType = data.UIType == null ? Q3D.Enums.poiUIType.CameraOrientedKeepSize : data.UIType;
        var iconAlphaEnabled = data.IconAlphaEnabled == null ? true : data.IconAlphaEnabled;

        var fontOutLine = data.FontOutLine;
        var fontEdgeColor = data.FontEdgeColor == null ? null : Q3D.colourValue(data.FontEdgeColor, 1);

        var alphaTestRef = data.AlphaTestRef;

        var location = data.Location == null ? Q3D.Enums.poiImagePositionType.POI_LOCATE_NONE : data.Location;
        var locationOffset = data.LocationOffset == null ? null : Q3D.vector2(data.LocationOffset);

        var backFrameBorderSize = data.BackFrameBorderSize;
        var backBorderColor = data.BackBorderColor == null ? null : Q3D.colourValue(data.BackBorderColor);
        var backFillColor = data.BackFillColor == null ? null : Q3D.colourValue(data.BackFillColor);

        var labelMargin = data.LabelMargin == null ? null : Q3D.vector2(data.LabelMargin);
        var iconLabelMargin = data.IconLabelMargin == null ? null : Q3D.vector2(data.IconLabelMargin);

        var specialTransparent = data.SpecialTransparent == null ? true : data.SpecialTransparent;
        var alwaysOnScreen = data.AlwaysOnScreen == null ? false : data.AlwaysOnScreen;
        var absPriority = data.AbsPriority;
        var relPriority = data.RelPriority;

        var onLoaded = data.OnLoaded;

        var createOptions = {
            Position: position, //封装Vector3对象
            Orientation: orientation, //封装Vector3对象
            OrientationType: orientationType,
            Scale: scale, //封装Vector3对象
            POIOptions: {
                FontSize: fontSize,
                FontName: fontName,
                FontColor: fontColor, //封装ColourValue对象
                CharScale: charScale,
                Text: text,
                Icon: icon,
                IconSize: iconSize, //封装Vector2对象
                POILayout: pOILayout,
                POILayoutCustom: pOILayoutCustom, //支持负数，取值0相当于LeftTop，1.0相当于LeftBottom，0.5相当于Left；只对POILayout为LeftCustom、TopCustom、RightCustom、BottomCustom时有效
                UIType: uIType,
                IconAlphaEnabled: iconAlphaEnabled,
                FontOutLine: fontOutLine, //同描边有关
                FontEdgeColor: fontEdgeColor, //封装ColourValue对象
                AlphaTestRef: alphaTestRef,
                Location: location,
                LocationOffset: locationOffset, //当Location为POI_LOCATE_CUSTOM起作用，封装Vector2对象
                BackFrameBorderSize: backFrameBorderSize, //同边框有关
                BackBorderColor: backBorderColor, //封装ColourValue对象
                BackFillColor: backFillColor, //封装ColourValue对象
                LabelMargin: labelMargin, //封装Vector2对象
                IconLabelMargin: iconLabelMargin, //封装Vector2对象，左右布局X分量有效，上下布局的Y分量有效
                SpecialTransparent: specialTransparent,
                AlwaysOnScreen: alwaysOnScreen,
                AbsPriority: absPriority,
                RelPriority: relPriority
            },
            OnLoaded: onLoaded //加载结束回调
        };
        return canvasMap.createPOI(nodePath, createOptions);
    },
    addPOIByJson: function (option) {
        var createOptions = {
            "AreaName": "",
            "FontSize": 20,
            "FontName": "宋体",
            "FontColor": "#000000",
            "CharScale": 1.0,
            "POILayout": 0,
            "UIType": 2,
            "IconAlphaEnabled": true,
            "FontOutLine": null,
            "FontEdgeColor": null,
            "AlphaTestRef": null,
            "Location": 768,
            "LocationOffset": null,
            "BackFrameBorderSize": null,
            "BackBorderColor": null,
            "BackFillColor": null,
            "LabelMargin": null,
            "IconLabelMargin": null,
            "SpecialTransparent": true,
            "AlwaysOnScreen": false,
            "POIS": null
        };
        q3d_common.extend(createOptions, option);
        //console.log(createOptions);
        return canvasMap.addPOIByJson(JSON.stringify(createOptions));
    },
    //画线
    createPolyline: function (data) {
        var nodePath = data.NodePath;

        var material = data.Material;
        var specialTransparent = data.SpecialTransparent == null ? false : data.SpecialTransparent;
        var linePoints = data.LinePoints == null ? [] : [data.LinePoints];
        var lineType = data.LineType == null ? Q3D.Enums.lineType.StraightLine : data.LineType;
        var besselDim = data.BesselDim == null ? 2 : data.BesselDim;
        var subdivision = data.Subdivision == null ? 20 : data.Subdivision;
        var lineWidth = data.LineWidth == null ? 2 : data.LineWidth;
        var wrapLen = data.WrapLen == null ? 2 : data.WrapLen;
        var color = data.Color == null ? Q3D.colourValue("#0000FF", 1) : Q3D.colourValue(data.Color, 1);
        var alpha = data.Alpha == null ? 1 : data.Alpha;
        var onLineCreated = data.OnLineCreated;

        var createOptions = {
            Material: material,
            SpecialTransparent: specialTransparent, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
            LinePoints: linePoints,
            LineOptions: {
                LineType: lineType,
                BesselDim: besselDim, //贝塞尔曲线阶数
                Subdivision: subdivision, //设置生成曲线细分程度，用于贝塞尔曲线
                LineWidth: lineWidth,
                WrapLen: wrapLen, //特殊材质有效
                //以下用于动态创建的材质
                Color: color, //线的颜色
                Alpha: alpha //线的透明度
            },
            OnLineCreated: onLineCreated
        };
        return canvasMap.createPolyline(nodePath, createOptions);
    },
    //画多边形
    createPolygon: function (data) {
        var nodePath = data.NodePath;

        var material = data.Material;
        var specialTransparent = data.SpecialTransparent == null ? false : data.SpecialTransparent;
        var points = data.Points == null ? [] : data.Points;
        var color = data.Color == null ? Q3D.colourValue("#0000FF", 1) : Q3D.colourValue(data.Color, 1);
        var alpha = data.Alpha == null ? 1 : data.Alpha;
        var direction = data.Direction == null ? 1 : data.Direction;
        var onPolygonCreated = data.OnPolygonCreated;

        var createOptions = {
            Material: material,
            SpecialTransparent: specialTransparent, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
            Points: points,//注意要剔除首尾相等的点
            Color: color,
            Alpha: alpha, //填充透明度
            Direction: direction, //默认逆时针方向
            OnPolygonCreated: onPolygonCreated
        };
        return canvasMap.createPolygon(nodePath, createOptions);
    },
    //画棱柱
    createPrism: function (data) {
        var nodePath = data.NodePath;

        var material = data.Material;
        var specialTransparent = data.SpecialTransparent == null ? false : data.SpecialTransparent;
        var color = data.Color == null ? Q3D.colourValue("#0000FF", 1) : Q3D.colourValue(data.Color, 1);
        var alpha = data.Alpha == null ? 1 : data.Alpha;
        var points = data.Points == null ? [] : data.Points;
        var anchor = data.Anchor;
        var ignoreFloor = data.IgnoreFloor == null ? true : data.IgnoreFloor;
        var height = data.Height == null ? 5 : data.Height;
        var onPrismCreated = data.OnPrismCreated;

        var createOptions = {
            Material: material,//设置棱柱的三个通用材质：0 底面 1 立面 2 顶面，如果只有一个设置成相同的数值
            SpecialTransparent: specialTransparent, //设置是否开启特殊透明效果，若开启，则被物体遮挡时会显示透明效果
            Color: color,//颜色材质使用的颜色
            Alpha: alpha,//颜色材质使用的透明度
            Points: points,//底面坐标数组，底面中心自动计算
            Anchor: anchor, //顶面中心坐标 Vector3，非垂直情况下可设置
            IgnoreFloor: ignoreFloor,
            Height: height,
            OnPrismCreated: onPrismCreated
        };
        return canvasMap.createPrism(nodePath, createOptions);
    },
    //创建管道
    createPipe: function (data) {
        var nodePath = data.NodePath;

        var material = data.Material;
        var specialTransparent = data.SpecialTransparent == null ? false : data.SpecialTransparent;
        var color = data.Color == null ? Q3D.colourValue("#0000FF", 1) : Q3D.colourValue(data.Color, 1);
        var alpha = data.Alpha == null ? 1 : data.Alpha;
        var points = data.Points == null ? [] : data.Points;
        var radius = data.Radius == null ? [] : data.Radius;
        var crossPieces = data.CrossPieces == null ? 24 : data.CrossPieces;
        var onPipeCreated = data.OnPipeCreated;

        var createOptions = {
            Material: material, //设置管道前、后、内、外四个材质，如果只有一个设置成相同的数值
            SpecialTransparent: specialTransparent, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
            Color: color, //颜色材质使用的颜色
            Alpha: alpha, //颜色材质使用的透明度
            Points: points,
            Radius: radius, //设置管道内径和外径，如果只有一个值，设为外径，如果有两个值，小的为内径，大的为外径
            CrossPieces: crossPieces, //设置生成管道圆面的面个数
            OnPipeCreated: onPipeCreated
        };
        return canvasMap.createPipe(nodePath, createOptions);
    },
    //画墙
    createWalls: function (data) {
        var nodePath = data.NodePath;

        var material = data.Material == null ? null : data.Material;
        var specialTransparent = data.SpecialTransparent == null ? false : data.SpecialTransparent;
        var color = data.Color == null ? Q3D.colourValue("#0000FF", 1) : Q3D.colourValue(data.Color, 1);
        var alpha = data.Alpha == null ? 1 : data.Alpha;
        var ignoreFloor = data.IgnoreFloor == null ? false : data.IgnoreFloor;
        var ignoreCeil = data.IgnoreCeil == null ? false : data.IgnoreCeil;
        var height = data.Height == null ? 5 : data.Height;
        var width = data.Width == null ? 2 : data.Width;
        var corners = data.Corners == null ? [] : data.Corners;
        var isClosed = data.IsClosed == null ? false : data.IsClosed;
        var sizeOfWalls = data.SizeOfWalls == null ? [] : data.SizeOfWalls;
        //var sizeOfWalls = [];
        //for (var j = 0; j < data.Corners.length; j++) {
        //    sizeOfWalls.push({ wallID: j, width: width, height: height })
        //}
        var matOfWalls = data.MatOfWalls == null ? [] : data.MatOfWalls;
        var onWallsCreated = data.OnWallsCreated;

        var createOptions = {
            Material: material, //设置墙体的5个通用材质：0 底面 1 顶面 2 左面 3 右面 4 断面，如果只有一个设置成相同的数值；如果多给的材质，可通过addMaterial添加
            SpecialTransparent: specialTransparent, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
            Color: color, //颜色材质使用的颜色
            Alpha: alpha, //颜色材质使用的透明度
            IgnoreFloor: ignoreFloor,
            IgnoreCeil: ignoreCeil,
            Height: height, //默认高度
            Width: width, //默认宽度
            //每段wall都可以有自己的宽高和材质
            Corners: corners, //所有坐标点Vector3坐标数组
            IsClosed: isClosed, //是否闭合标志
            SizeOfWalls: sizeOfWalls, //每段wall的自己宽高，如{wallID:1,width:1.0, height:2.5}，其中wallID为起始坐标点在坐标数组的序号
            MatOfWalls: matOfWalls, //每段wall的自己材质，如{wallID:1,data:[{compID:1, mtrID:2},{compID:2, mtrID:2}]}
            OnWallsCreated: onWallsCreated,
        };
        return canvasMap.createWalls(nodePath, createOptions);
    },
    //画圆柱
    createCylinder: function (data) {
        var nodePath = data.NodePath;

        var material = data.Material;
        var specialTransparent = data.SpecialTransparent == null ? false : data.SpecialTransparent;
        var color = data.Color == null ? Q3D.colourValue("#0000FF", 1) : Q3D.colourValue(data.Color, 1);
        var alpha = data.Alpha == null ? 1 : data.Alpha;
        var center = data.Center;
        var anchor = data.Anchor;
        var radius = data.Radius == null ? 10 : data.Radius;
        var height = data.Height == null ? 50 : data.Height;
        var pieces = data.Pieces == null ? 36 : data.Pieces;
        var onCylinderCreated = data.OnCylinderCreated;

        var createOptions = {
            Material: material, //设置圆柱底面、立面、顶面三个材质，如果只有一个设置成相同的数值
            SpecialTransparent: specialTransparent, //设置是否开启特殊透明效果，若开启，则被物体遮挡时会显示透明效果
            Color: color, //颜色材质使用的颜色
            Alpha: alpha, //颜色材质使用的透明度
            Center: center, //底面中心坐标 Vector3
            Anchor: anchor, //顶面中心坐标 Vector3，非垂直情况下可设置
            Radius: radius, //半径
            Height: height, //高度
            Pieces: pieces, //设置生成圆面的面个数
            OnCylinderCreated: onCylinderCreated
        };
        return canvasMap.createCylinder(nodePath, createOptions);
    },
    //画球
    createSphere: function (data) {
        var nodePath = data.NodePath;

        var material = data.Material;
        var specialTransparent = data.SpecialTransparent == null ? false : data.SpecialTransparent;
        var color = data.Color == null ? Q3D.colourValue("#0000FF", 1) : Q3D.colourValue(data.Color, 1);
        var alpha = data.Alpha == null ? 1 : data.Alpha;
        var center = data.Center;
        var radius = data.Radius == null ? 10 : data.Radius;
        var onSphereCreated = data.OnSphereCreated;

        var createOptions = {
            Material: material, //设置球面材质
            SpecialTransparent: specialTransparent, //设置是否开启特殊透明效果，若开启，则线被物体遮挡时会显示透明效果
            Color: color, //颜色材质使用的颜色
            Alpha: alpha, //颜色材质使用的透明度
            Center: center, //球心坐标，Vector3，(约定：节点与球心重合)
            Radius: radius, //半径
            OnSphereCreated: onSphereCreated
        };
        return canvasMap.createSphere(nodePath, createOptions);
    },
    //画圆锥
    createCone: function (data) {
        var nodePath = data.NodePath;

        var material = data.Material;
        var specialTransparent = data.SpecialTransparent == null ? false : data.SpecialTransparent;
        var color = data.Color == null ? Q3D.colourValue("#0000FF", 1) : Q3D.colourValue(data.Color, 1);
        var alpha = data.Alpha == null ? 1 : data.Alpha;
        var center = data.Center;
        var anchor = data.Anchor;
        var radius = data.Radius == null ? 10 : data.Radius;
        var height = data.Height == null ? 50 : data.Height;
        var pieces = data.Pieces == null ? 36 : data.Pieces;
        var onConeCreated = data.OnConeCreated;

        var createOptions = {
            Material: material, //设置圆锥底面、立面二个材质，如果只有一个设置成相同的数值
            SpecialTransparent: specialTransparent, //设置是否开启特殊透明效果，若开启，则被物体遮挡时会显示透明效果
            Color: color, //颜色材质使用的颜色
            Alpha: alpha, //颜色材质使用的透明度
            Center: center, //底面中心坐标 Vector3
            Anchor: anchor, //顶面中心坐标 Vector3，非垂直情况下可设置
            Radius: radius, //半径
            Height: height, //高度
            Pieces: pieces, //设置生成圆面的面个数
            OnConeCreated: onConeCreated
        };
        return canvasMap.createCone(nodePath, createOptions);
    },
    //创建粒子
    createParticle: function (data) {
        var nodePath = data.NodePath;

        var position = data.Position;
        var orientation = data.Orientation == null ? null : Q3D.vector3(data.Orientation);
        var orientationType = data.OrientationType == null ? Q3D.Enums.nodeOrientationType.Self : data.OrientationType;
        var particleFile = data.ParticleFile;
        var onParticleCreated = data.OnParticleCreated;

        var createOptions = {
            Position: position, //粒子节点的位置 Vector3
            Orientation: orientation,
            OrientationType: orientationType,
            ParticleFile: particleFile, //粒子文件路径，如Particle/fire.par
            OnParticleCreated: onParticleCreated
        };
        return canvasMap.createParticle(nodePath, createOptions);
    },
    //创建公告板
    createBillboard: function (data) {
        var nodePath = data.NodePath;

        var position = data.Position;
        var orientation = data.Orientation == null ? null : Q3D.vector3(data.Orientation);
        var orientationType = data.OrientationType == null ? Q3D.Enums.nodeOrientationType.Self : data.OrientationType;
        var size = data.Size == null ? null : Q3D.vector2(data.Size);
        var material = data.Material;
        var type = data.Type == null ? Q3D.Enums.billboardType.Oriented_Common : data.Type;
        var commonDirection = data.CommonDirection == null ? null : Q3D.vector3(data.CommonDirection);
        var onBillboardCreated = data.OnBillboardCreated;

        var createOptions = {
            Position: position, //公告版节点的位置 Vector3
            Orientation: orientation,
            OrientationType: orientationType,//Vector3
            Size: size,//Vector2
            Material: material,
            Type: type,
            CommonDirection: commonDirection,//Vector3
            OnBillboardCreated: onBillboardCreated
        };
        return canvasMap.createBillboard(nodePath, createOptions);
    },
    //创建多边形贴花
    createDecal: function (data) {
        var nodePath = data.NodePath;

        var points = data.Points == null ? [] : data.Points;
        var resolution = data.Resolution == null ? 1.0 : data.Resolution;
        var maxHeight = data.MaxHeight == null ? 100 : data.MaxHeight;
        var backColor = data.BackColor == null ? null : Q3D.colourValue(data.BackColor, 1);
        var fillColor = data.FillColor == null ? Q3D.colourValue("#0000FF", 0.6) : Q3D.colourValue(data.FillColor, 1);
        var lineColor = data.LineColor == null ? Q3D.colourValue("#0000FF", 1.0) : Q3D.colourValue(data.LineColor, 1);
        var lineWidth = data.LineWidth == null ? 1 : data.LineWidth;
        var fillMode = data.FillMode == null ? Q3D.Enums.decalTexFillMode.FillAndFrame : data.FillMode;
        var onDecalCreated = data.OnDecalCreated;

        var createOptions = {
            Points: points, //Vector3坐标数组
            Resolution: resolution, //像素分辨率，单位米/像素
            MaxHeight: maxHeight, //多边形区域内最大高度值
            BackColor: backColor, //背景填充色，默认为null
            FillColor: fillColor, //多边形填充颜色和透明值
            LineColor: lineColor, //多边形边框颜色和透明值
            LineWidth: lineWidth, //多边形轮廓线宽
            FillMode: fillMode, //填充方式
            OnDecalCreated: onDecalCreated
        };
        return canvasMap.createDecal(nodePath, createOptions);
    },
    //创建圆形贴花
    createCircleDecal: function (data) {
        var nodePath = data.NodePath;

        var center = data.Center == null ? Q3D.vector2(0, 0) : Q3D.vector2(data.Center);
        var radius = data.Radius == null ? 10 : data.Radius;
        var resolution = data.Resolution == null ? 1.0 : data.Resolution;
        var maxHeight = data.MaxHeight == null ? 100 : data.MaxHeight;
        var backColor = data.BackColor == null ? null : Q3D.colourValue(data.BackColor, 1);
        var fillColor = data.FillColor == null ? Q3D.colourValue("#0000FF", 0.6) : Q3D.colourValue(data.FillColor, 1);
        var lineColor = data.LineColor == null ? Q3D.colourValue("#0000FF", 1.0) : Q3D.colourValue(data.LineColor, 1);
        var lineWidth = data.LineWidth == null ? 1 : data.LineWidth;
        var fillMode = data.FillMode == null ? Q3D.Enums.decalTexFillMode.FillAndFrame : data.FillMode;
        var onDecalCreated = data.OnDecalCreated;

        var createOptions = {
            Center: center, //Vector2中心坐标
            Radius: radius, //半径
            Resolution: resolution, //像素分辨率，单位米/像素
            MaxHeight: maxHeight, //多边形区域内最大高度值
            BackColor: backColor, //背景填充色，默认为null
            FillColor: fillColor, //多边形填充颜色和透明值
            LineColor: lineColor, //多边形边框颜色和透明值
            LineWidth: lineWidth, //多边形轮廓线宽
            FillMode: fillMode, //填充方式
            OnDecalCreated: onDecalCreated
        };
        return canvasMap.createCircleDecal(nodePath, createOptions);
    },
    //创建模型
    createModel: function (data) {
        var nodePath = data.NodePath;

        var position = data.Position;
        var orientation = data.Orientation == null ? null : Q3D.vector3(data.Orientation);
        var orientationType = data.OrientationType == null ? Q3D.Enums.nodeOrientationType.Self : data.OrientationType;
        var scale = data.Scale == null ? null : Q3D.vector3(data.Scale);
        var specialTransparent = data.SpecialTransparent == null ? false : data.SpecialTransparent;
        var meshName = data.MeshName;
        var skeletonAnimation = data.SkeletonAnimation;
        var onLoaded = data.OnLoaded;

        var createOptions = {
            Position: position,//封装Vector3对象
            Orientation: orientation,//封装Vector3对象
            OrientationType: orientationType,
            Scale: scale,//封装Vector3对象
            SpecialTransparent: specialTransparent,
            SkeletonAnimation: skeletonAnimation,//骨骼动画名称
            OnLoaded: onLoaded//加载结束回调
        };
        return canvasMap.createModel(nodePath, meshName, createOptions);
    },
    //显示视频弹框
    showVideoDialog: function (option) {
        var videoCtrlName = option.VideoCtrlName;

        var videoPath = option.VideoPath;
        var videoType = option.VideoType == null ? Q3D.Enums.videoSourceType.VIDSRC_NETSTREAM : option.VideoType;
        var titleText = option.TitleText == null ? "" : option.TitleText;
        var titleColor = option.TitleColor == null ? Q3D.colourValue("#000000", 1) : Q3D.colourValue(option.TitleColor, 1);
        var titleHeight = option.TitleHeight == null ? 20 : option.TitleHeight;
        var left = option.Left == null ? 0 : option.Left;
        var top = option.Top == null ? 0 : option.Top;
        var width = option.Width == null ? 200 : option.Width;
        var height = option.Height == null ? 200 : option.Height;
        var targetNodeName = option.TargetNodeName;
        var targetPosition = option.TargetPosition;
        var attachNodeName = option.AttachNodeName;
        var isIndicatrixVisible = option.IsIndicatrixVisible == null ? true : option.IsIndicatrixVisible;
        var indicatrixWidth = option.IndicatrixWidth == null ? 2 : option.IndicatrixWidth;
        var indicatrixMatrial = option.IndicatrixMatrial == null ? "" : option.IndicatrixMatrial;
        var indicatrixLocation = option.IndicatrixLocation == null ? 1 : option.IndicatrixLocation;
        var draggable = option.Draggable == null ? true : option.Draggable;
        var onVideoCtrlClose = option.OnVideoCtrlClose;

        var videoDialogOptions = {
            VideoPath: videoPath,
            VideoType: videoType, //设置视频类型：VIDSRC_NETSTREAM - 网络实时视频流；VIDSRC_LOCAL - 本地视频。
            Title: {
                //设置窗口标题（文字、颜色、像素高度）
                Text: titleText,
                Color: titleColor,
                Height: titleHeight
            },
            Left: left, //设置窗口左上角位置
            Top: top, //设置窗口左上角位置
            Width: width, //设置窗口宽度（屏幕坐标）
            Height: height, //设置窗口高度（屏幕坐标）
            TargetNodeName: targetNodeName, //设置目标节点名称
            TargetPosition: targetPosition, //设置目标位置(QVector3d）
            AttachNodeName: attachNodeName, //附着到某个指定节点名称（窗口位置跟随某个节点调整,此时窗口不能被随意拖动,可以调整大小）
            IsIndicatrixVisible: isIndicatrixVisible, //设置指示线是否可见
            IndicatrixWidth: indicatrixWidth, //设置指向线的线宽
            IndicatrixMatrial: indicatrixMatrial, //设置指向线的材质名
            IndicatrixLocation: indicatrixLocation, //设置指示线连接位置：0 - center; 1 - nearest corner
            Draggable: draggable, //是否允许拖动
            OnVideoCtrlClose: onVideoCtrlClose //视频窗口关闭回调事件
        };
        return canvasMap.showVideoDialog(videoCtrlName, videoDialogOptions);
    },
    //动态光圈+颜色渐变+透明度渐变
    lightRingGradientAni: function () {
        var p1 = canvasMap.createMovieClip("movie_clip_uv", 50).then(function (result) {
            //console.log("p1");
            //console.log(result);
            return result;
        });
        var p2 = p1.then(function (result) {
            //console.log("p1->p2");
            //console.log(result);
            return canvasMap.createMovieClipInstance("movie_clip_inst_uv", result);
        }).then(function (result) {
            //console.log("p2");
            //console.log(result);
            return result;
        });

        var p = Promise.all([p1, p2]).then(function (result) {
            //console.log("p");
            //console.log(result);
            var mcObj = result[0];
            var mciObj = result[1];

            var uvInfo = [{ Key: 0, Value: Q3D.vector2(0, 0) }, { Key: 120, Value: Q3D.vector2(0, 1.0) }];
            var alphaInfo = [{ Key: 0, Value: 1.0 }, { Key: 50, Value: 1.0 }, { Key: 80, Value: 0.0 }, { Key: 120, Value: 0.0 }];
            var clrInfo = [{ Key: 0, Value: Q3D.colourValue("#E50743", 1) }, { Key: 60, Value: Q3D.colourValue("#F9870F", 1) }, { Key: 120, Value: Q3D.colourValue("#E8ED30", 1) }];
            var p_1 = canvasMap.addActorUVAnimation(mcObj, "testuv", Q3D.Enums.actorTrackType.TUDiffuseUVScroll, uvInfo).then(function (result1) {
                //console.log("p_1");
                //console.log(result1);
                return result1;
            });
            var p_2 = p_1.then(function (result1) {
                return canvasMap.addActorColorAlphaAnimation(mcObj, "testuv", alphaInfo);
            }).then(function (result2) {
                //console.log("p_2");
                //console.log(result2);
                return result2;
            });
            var p_3 = p_2.then(function (result1) {
                return canvasMap.addActorColorAnimation(mcObj, "testuv", Q3D.Enums.actorTrackType.ColorEmissive, clrInfo);
            }).then(function (result3) {
                //console.log("p_3");
                //console.log(result3);
                return result3;
            });

            var p_all = Promise.all([p_1, p_2, p_3]).then(function (resultAll) {
                //console.log("p_all");
                //console.log(resultAll);

                mciObj.setPlayer("testuv", Q3D.Enums.playerType.Material, "Material/uv.mtr");
                mciObj.setLoop(true);
                mciObj.play();

                return mciObj;
            });
            return p_all;
        });
        return p;
    },

    //获取当前视角(经纬度)
    //q3d_common.getCurrentView().then(function(result){console.log(result[0].toString(6) + "|" + result[1].toString(4));});
    getCurrentView: function () {
        var cam = Q3D.globalCamera();
        var p1 = cam.getAbsPos().then(function (result1) {
            //console.log("result1");
            //console.log(result1);//QVector3d
            return Q3D.vector3d(result1).toGlobalVec3d();//QVector3d->Vector3d->QGlobalVec3d
        }).then(function (result2) {
            //console.log("result2");
            //console.log(result2);//QGlobalVec3d
            return Q3D.globalVec3d(result2);//QGlobalVec3d->GlobalVec3d
        });
        var p2 = cam.getOrientation(2).then(function (result) {
            return Q3D.vector3(result);//QVector3->Vector3
        })
        var p = Promise.all([p1, p2]).then(function (result) {
            //console.log(result);
            return result;
        });
        return p;
    },
    //灯光切换
    changeLights: function (flag) {
        if (flag == 0) {//白天
            q3d_common.dayLights();
        }
        else {//黑夜
            q3d_common.nightLights();
        }
    },
    //白天
    dayLights: function () {
        if (q3d_common.dataCache.currStatus == 0) return;

        //地形显示

        var mapObj = canvasMap.get();
        var wm = mapObj.getWorldManager();

        var p_evt = asyncHandle(wm, wm.getEnvironment, AsyncFunImpl.QEnvironment, 0).then(function (r_evt) {
            return r_evt;
        });
        //2个天空盒 "sky"、"black"，通过控制"black"来控制天空盒
        var p_sky = p_evt.then(function (r_evt) {
            return asyncHandle(r_evt, r_evt.getSky, AsyncFunImpl.QSky, "black");//"sky"
        }).then(function (r_sky) {
            r_sky.setVisible(0);
            return r_sky;
        });
        var p_fog = p_evt.then(function (r_evt) {
            r_evt.setFog(1, Q3D.colourValue(0.407843, 0.615686, 0.890196, 0).get(), 4500, 15000);//rgba(104, 157, 227, 0)
            return r_evt;
        });
        var p = Promise.all([p_evt, p_sky, p_fog]).then(function (r) {
            var p_a1 = canvasMap.getArea("light_yeguang").then(function (r_area) {
                if (r_area != null) { r_area.setVisible(0); }
                return r_area;
            });
            var p_a2 = canvasMap.getArea("ydimian").then(function (r_area) {
                if (r_area != null) { r_area.setVisible(0); }
                return r_area;
            });
            var p_a3 = canvasMap.getArea("yjianzhu").then(function (r_area) {
                if (r_area != null) { r_area.setVisible(0); }
                return r_area;
            });
            var p_a4 = canvasMap.getArea("texiaotest").then(function (r_area) {
                if (r_area != null) { r_area.setVisible(0); }
                return r_area;
            });
            //当前场景切换采取显示隐藏方案，不用loadArea
            //loadArea 调用2次引擎无响应
            var p_a5 = canvasMap.getArea("rijing").then(function (r_area) {
                if (r_area != null) { r_area.setVisible(1); }
                //else { canvasMap.loadArea("rijing"); }
                return r_area;
            });
            var p_a6 = canvasMap.getArea("light_hdr").then(function (r_area) {
                if (r_area != null) { r_area.setVisible(1); }
                //else { canvasMap.loadArea("light_hdr"); }
                return r_area;
            });

            var p_all = Promise.all([p_a1, p_a2, p_a3, p_a4, p_a5, p_a6]).then(function (r_all) {
                //console.log("p_all");
                //console.log(r_all);
                console.log("切换白天完成");

                q3d_common.dataCache.currStatus = 0;

                return r_all;
            });
            return p_all;
        });
        return p;
    },
    //黑夜
    nightLights: function () {
        if (q3d_common.dataCache.currStatus == 1) return;

        //地形隐藏

        var mapObj = canvasMap.get();
        var wm = mapObj.getWorldManager();

        var p_evt = asyncHandle(wm, wm.getEnvironment, AsyncFunImpl.QEnvironment, 0).then(function (r_evt) {
            return r_evt;
        });
        var p_sky = p_evt.then(function (r_evt) {
            return asyncHandle(r_evt, r_evt.getSky, AsyncFunImpl.QSky, "black");//"sky"
        }).then(function (r_sky) {
            r_sky.setVisible(1);
            return r_sky;
        });
        var p_fog = p_evt.then(function (r_evt) {
            r_evt.setFog(0, Q3D.colourValue(0.407843, 0.615686, 0.890196, 0).get(), 4500, 15000);//rgba(104, 157, 227, 0)
            return r_evt;
        });
        var p = Promise.all([p_evt, p_sky, p_fog]).then(function (r) {
            var p_a1 = canvasMap.getArea("light_yeguang").then(function (r_area) {
                if (r_area != null) { r_area.setVisible(1); }
                return r_area;
            });
            var p_a2 = canvasMap.getArea("ydimian").then(function (r_area) {
                if (r_area != null) { r_area.setVisible(1); }
                return r_area;
            });
            var p_a3 = canvasMap.getArea("yjianzhu").then(function (r_area) {
                if (r_area != null) { r_area.setVisible(1); }
                return r_area;
            });
            var p_a4 = canvasMap.getArea("texiaotest").then(function (r_area) {
                if (r_area != null) { r_area.setVisible(1); }
                return r_area;
            });
            var p_a5 = canvasMap.getArea("rijing").then(function (r_area) {
                if (r_area != null) { r_area.setVisible(0); }
                return r_area;
            });
            var p_a6 = canvasMap.getArea("light_hdr").then(function (r_area) {
                if (r_area != null) { r_area.setVisible(0); }
                return r_area;
            });

            var p_all = Promise.all([p_a1, p_a2, p_a3, p_a4, p_a5, p_a6]).then(function (r_all) {
                //console.log("p_all");
                //console.log(r_all);
                console.log("切换黑夜完成");

                q3d_common.dataCache.currStatus = 1;

                return r_all;
            });
            return p_all;
        });
        return p;
    },
};