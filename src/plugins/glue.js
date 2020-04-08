var g_map = null;

var tailStatus = function() {
  if (
    typeof statusElement == "undefined" ||
    typeof progressElement == "undefined" ||
    typeof spinnerElement == "undefined"
  )
    return false;
  return true;
};

// function asyncHandle(asyncObject, asyncFun, typeFun, ...values){
//   var r = new Module.AsyncFunReturn;

//   if (values.length >= 1){
//     asyncFun.call(asyncObject, r, values);
//   }
//   else
//     asyncFun.call(asyncObject, r);

//   return new Promise(resolve => {
//     var intervalID = setInterval(() => {
//       if (r.hasReturn) {
//         clearInterval(intervalID);
//         resolve(typeFun.call(r));
//       }
//     }, 1);
//   });
// }

function asyncHandle(asyncObject, asyncFun, typeFun, ...values) {
  var r = new Module.AsyncFunReturn();

  if (values.length == 1) {
    asyncFun.call(asyncObject, r, values.shift());
  } else if (values.length == 2) {
    asyncFun.call(asyncObject, r, values.shift(), values.shift());
  } else if (values.length == 3) {
    asyncFun.call(
      asyncObject,
      r,
      values.shift(),
      values.shift(),
      values.shift()
    );
  } else if (values.length == 4) {
    asyncFun.call(
      asyncObject,
      r,
      values.shift(),
      values.shift(),
      values.shift(),
      values.shift()
    );
  } else if (values.length == 5) {
    asyncFun.call(
      asyncObject,
      r,
      values.shift(),
      values.shift(),
      values.shift(),
      values.shift(),
      values.shift()
    );
  } else if (values.length == 6) {
    asyncFun.call(
      asyncObject,
      r,
      values.shift(),
      values.shift(),
      values.shift(),
      values.shift(),
      values.shift(),
      values.shift()
    );
  } else if (values.length == 7) {
    asyncFun.call(
      asyncObject,
      r,
      values.shift(),
      values.shift(),
      values.shift(),
      values.shift(),
      values.shift(),
      values.shift(),
      values.shift()
    );
  } else asyncFun.call(asyncObject, r);

  return new Promise(resolve => {
    var intervalID = setInterval(() => {
      if (r.hasReturn) {
        clearInterval(intervalID);
        var result = typeFun.call(r);
        r.isNull ? resolve(null) : resolve(result);
      }
    }, 1);
  });
}

var AsyncFunImpl, handleEventMsg;
var Module = {
  onEventCallback: function() {
    try {
      if (typeof eval(handleEventMsg) == "function") handleEventMsg();
    } catch (e) {}
  },
  onRuntimeInitialized: function() {
    try {
      if (typeof renderServIP == "string") {
        var g_engineClient = Module.EngineClient.impl();
        g_engineClient.setIP(renderServIP);
      }
    } catch (e) {}
  },
  preRun: function() {
    //console.log("enter preRun");
  },
  postRun: function() {
    var g_engineClient = Module.EngineClient.impl();

    const seconds = 50;
    var nTimes = 10 * seconds;
    var intervalID = setInterval(function() {
      if (g_engineClient.isConnect()) {
        clearInterval(intervalID);
        AsyncFunImpl = new Module.AsyncFunReturn();
        try {
          if (typeof eval(initProj) == "function") initProj();
        } catch (e) {}
      }

      if (--nTimes == 0 || !g_engineClient.isRunning()) {
        clearInterval(intervalID);
        console.log("engine start failed!\n");
      }
    }, 100);

    var aliveIntervalID = setInterval(function() {
      if (AsyncFunImpl && g_engineClient.isRunning()) {
        Module.EngineClient.impl().keepAlive();
      } else {
        clearInterval(aliveIntervalID);
      }
    }, 10000);
  },
  print: (function() {
    var element = document.querySelector("#output");
    if (element) element.value = ""; // clear browser cache
    return function(text) {
      if (arguments.length > 1)
        text = Array.prototype.slice.call(arguments).join(" ");
      // These replacements are necessary if you render to raw HTML
      //text = text.replace(/&/g, "&amp;");
      //text = text.replace(/</g, "&lt;");
      //text = text.replace(/>/g, "&gt;");
      //text = text.replace('\n', '<br>', 'g');
      //console.log(text);
      if (element) {
        element.value += text + "\n";
        element.scrollTop = element.scrollHeight; // focus on bottom
      }
    };
  })(),
  printErr: function(text) {
    if (arguments.length > 1)
      text = Array.prototype.slice.call(arguments).join(" ");
    //console.error(text);
  },
  canvas: (function() {
    var canvas = document.querySelector("canvas");

    // As a default initial behavior, pop up an alert when webgl context is lost. To make your
    // application robust, you may want to override this behavior before shipping!
    // See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2
    canvas.addEventListener(
      "webglcontextlost",
      function(e) {
        alert("WebGL context lost. You will need to reload the page.");
        e.preventDefault();
      },
      false
    );

    return canvas;
  })(),
  setStatus: function(text) {
    if (!tailStatus()) return;

    if (!Module.setStatus.last)
      Module.setStatus.last = {
        time: Date.now(),
        text: ""
      };
    if (text === Module.setStatus.last.text) return;
    var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
    var now = Date.now();
    if (m && now - Module.setStatus.last.time < 30) return; // if this is a progress update, skip it if too soon
    Module.setStatus.last.time = now;
    Module.setStatus.last.text = text;
    if (m) {
      text = m[1];
      progressElement.value = parseInt(m[2]) * 100;
      progressElement.max = parseInt(m[4]) * 100;
      progressElement.hidden = false;
      spinnerElement.hidden = false;
    } else {
      progressElement.value = null;
      progressElement.max = null;
      progressElement.hidden = true;
      if (!text) spinnerElement.hidden = true;
    }
    statusElement.innerHTML = text;
  },
  totalDependencies: 0,
  monitorRunDependencies: function(left) {
    this.totalDependencies = Math.max(this.totalDependencies, left);
    Module.setStatus(
      left
        ? "Preparing... (" +
            (this.totalDependencies - left) +
            "/" +
            this.totalDependencies +
            ")"
        : "All downloads complete."
    );
  }
};
Module.setStatus("Downloading...");
window.onerror = function() {
  if (tailStatus()) {
    Module.setStatus("Exception thrown, see JavaScript console");
    spinnerElement.style.display = "none";
    Module.setStatus = function(text) {
      if (text) Module.printErr("[post-exception status] " + text);
    };
  }
};
