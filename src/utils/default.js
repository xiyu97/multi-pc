(function () {
    function getIEVersion() { var e = 99; if ("Microsoft Internet Explorer" == navigator.appName) { var t = navigator.userAgent; null != new RegExp("MSIE ([0-9]{1,}[.0-9]{0,})").exec(t) && (e = parseFloat(RegExp.$1)) } return e } getIEVersion() < 8 && (window.location.href = "./product.html")




    var origDefineProperty = Object.defineProperty;
    var arePropertyDescriptorsSupported = function () {
        var obj = {};
        try {
            origDefineProperty(obj, "x", { enumerable: false, value: obj });
            for (var _ in obj) {
                return false;
            }
            return obj.x === obj;
            // ![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcpc5c7f3ae78eb4f75a16529ee8ee34768~tplv-k3u1fbpfcp-watermark.image)
        } catch (e) {
            /* this is IE 8. */
            return false;
        }
    };
    var supportsDescriptors =
        origDefineProperty && arePropertyDescriptorsSupported();

    if (!supportsDescriptors) {
        Object.defineProperty = function (a, b, c) {
            //IE8支持修改元素节点的属性
            if (origDefineProperty && a.nodeType == 1) {
                return origDefineProperty(a, b, c);
            } else {
                a[b] = c.value || (c.get && c.get());
            }
        };
    }
})(window)