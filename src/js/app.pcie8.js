// 修复resize方法被无限调用
// (function ($, h, c) { var a = $([]), e = $.resize = $.extend($.resize, {}), i, k = "setTimeout", j = "resize", d = j + "-special-event", b = "delay", f = "throttleWindow"; e[b] = 250; e[f] = true; $.event.special[j] = { setup: function () { if (!e[f] && this[k]) { return false } var l = $(this); a = a.add(l); $.data(this, d, { w: l.width(), h: l.height() }); if (a.length === 1) { g() } }, teardown: function () { if (!e[f] && this[k]) { return false } var l = $(this); a = a.not(l); l.removeData(d); if (!a.length) { clearTimeout(i) } }, add: function (l) { if (!e[f] && this[k]) { return false } var n; function m(s, o, p) { var q = $(this), r = $.data(this, d); r.w = o !== c ? o : q.width(); r.h = p !== c ? p : q.height(); n.apply(this, arguments) } if ($.isFunction(l)) { n = l; return m } else { n = l.handler; l.handler = m } } }; function g() { i = h[k](function () { a.each(function () { var n = $(this), m = n.width(), l = n.height(), o = $.data(this, d); if (m !== o.w || l !== o.h) { n.trigger(j, [o.w = m, o.h = l]) } }); g() }, e[b]) } })(jQuery, this);


// 公共封装方法

$.extend({
    base_url: '',
    request: function (obj, postType) {
        // console.log(obj)
        var data = obj.data || '',
            type = obj.method || 'get',
            success = obj.success,
            url = obj.url,
            zeroLayer = obj.zero || false,
            asy = obj.asy || true,
            headers = obj.headers || {};
        layer && layer.load(0)
    
        postType === 'json' && (
            headers['Content-Type'] = 'application/json'
        )
    
        var user = localStorage.getItem('X-User');
    
        if (user) {
            var _user = JSON.parse(user);
            headers['X-Sign'] = _user.sign;
            headers['X-Token'] = _user.token;
        }
        var proce = {}
        type === 'post' && (
            proce = {
                contentType: false,
                processData: false,
            }
        )
        $.ajax({
            url: this.base_url + url,
            type: type,
            data: data,
            headers: headers,
            // ...proce,
            async: asy,     // 是否使用异步请求 (默认是异步的)
            success: function (response) {
                layer && layer.closeAll()
                if (response.code === -4001) {
                    layer.msg(response.msg)
                    setTimeout(function(){
                        window.location.replace('./authorize.html?return_url=' + encodeURIComponent(window.location.href));
                    }, 350);
                } else if (response.code === 0 && !zeroLayer) {
                    layer.msg(response.msg)
                } else {
                    success && success(response);
                }
            },
            fail: function (err) {
                layer && layer.closeAll()
                console.log(err);
            },
            complete: function (e) {
                // console.log('conplete',e)
                if (e.status !== 200) {
                    layer && layer.closeAll()
                }
            }
        })
    },
    /**
 * uploadFile 方法
 * @param {banary} file 传入选择的图片
 */
    uploadFile: function (file, success) {
        var myFile = new FormData();
        myFile.append("Filedata", file);
        console.log(myFile.get('Filedata'));


        $.ajax({
            url: this.base_url + 'upload',
            type: 'post',
            data: myFile,
            contentType: false,
            processData: false,
            dataType: 'json',
            success: function (res) {
                success && success(res);
            },
            fail: function (err) {
                console.log(err);
            }
        })
    },

    // 设置cookie
    setCookie: function (c_name, value, expiredays) {
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + expiredays);
        document.cookie = c_name + "=" + encodeURIComponent(value) +
            ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString())
    },
    //取回cookie  
    getCookie: function (c_name) {
        if (document.cookie.length > 0) {
            var c_arr = document.cookie.split('; ');
            for (var i = 0, len = c_arr.length; i < len; i++) {
                var item_arr = c_arr[i].split('=');
                if (item_arr[0] === c_name) {
                    return decodeURIComponent(item_arr[1]);
                }
            }
        }
        return "";
    },
    // 获取url携带参数
    getParam: function (key) {
        var params = {};
        if(location.search){
            var _arr = location.search.substr(1).split('&');
            for (var i = 0; i < _arr.length; i++) {
                _arr[i] = _arr[i].split('=')
                params[_arr[i][0]] = _arr[i][1]
            }
        }
        return params[key] || ''
    },
    getParams: function () {
        var params = {};
        if(location.search){
            var _arr = location.search.substr(1).split('&');
            for (var i = 0; i < _arr.length; i++) {
                _arr[i] = _arr[i].split('=')
                params[_arr[i][0]] = _arr[i][1]
            }
        }
        return params
    },
    // 触底加载
    onReachBottom: function (fn) {
        var that = this;
        var argu = '';
        fn && (argu = fn.arguments);
        window.addEventListener('scroll', function scroll() {
            var clientH = document.getElementById('app').clientHeight,
                scrollT = document.body.scrollTop || document.documentElement.scrollTop,
                isLoad = scrollT + innerHeight >= clientH - 5;
            if (isLoad) {
                fn && fn.call(that, argu)
            }
        })
    },
    // 深克隆
    deepClone: function (source) {
        var targetObj = source.constructor === Array ? [] : {}; // 判断复制的目标是数组还是对象
        for (var keys in source) { // 遍历目标
            if (source.hasOwnProperty(keys)) {
                if (source[keys] && typeof source[keys] === 'object') { // 如果值是对象，就递归一下
                    targetObj[keys] = source[keys].constructor === Array ? [] : {};
                    targetObj[keys] = this.deepClone(source[keys]);
                } else { // 如果不是，就直接赋值
                    targetObj[keys] = source[keys];
                }
            }
        }
        return targetObj;
    },
    // 简版多行省略
    setEllipsis: function (_class) {
        var el = $(_class);
        for (var i = 0, len = el.length; i < len; i++) {
            var element = el[i],
                str = element.innerHTML;

            for (var j = 0, len1 = str.length; j <= len1; j++) {
                element.innerHTML = str.substr(0, j);
                if (element.scrollHeight - element.offsetHeight > 6) {
                    // element.style.overflow = 'hidden';
                    element.innerHTML = str.substr(0, j - 3) + '...';
                    // i== 1 && console.log(element.innerHTML,'===============')
                    break;
                }
            }
        }
    },
    /**
     * 
     * @param {number} needDelay 时间间隙
     * @param {number} countdown 倒计时初始时间戳
     * @param {function} runningFn 执行时回调函数
     * @param {function} fn 结束时回调函数
     */
    startCountdown: function (needDelay, countdown, runningFn, fn) {
        var countIndex = 1; // 倒计时任务执行次数
        var startTime = new Date().getTime();
        var context = this;
        var runningArgs = runningFn && runningFn.arguments;
        var args = fn && fn.arguments;

        _startCountdown(needDelay);

        function _startCountdown(delay) {
            setTimeout(function () {
                var endTime = new Date().getTime();
                // 偏差值
                var deviation = endTime - (startTime + countIndex * needDelay);
                // console.log(`${countIndex}: 偏差${deviation}ms`);

                countIndex++;
                countdown -= needDelay;
                runningFn && runningFn.call(context, countdown)

                if (countdown <= 0) {
                    fn && fn.call(context, args);
                    return;
                }
                // 下一次倒计时
                _startCountdown(needDelay - deviation);
            }, delay);
        }
    },

    _downloadFile: function (url, name) {
        if (!!window.ActiveXObject || "ActiveXObject" in window) {
            //ie
            var oPow = window.open(url, "", "width = 1, height = 1, top = 5000, left = 5000 ");
            var isOpen = true; //判断window.open是否被禁用
            try {
                if (oPow == null) {
                    isOpen = false
                }
            } catch (err) {
                isOpen = false
            }
            if (isOpen) {
                //没禁用window.open采用window.open下载
                while (oPow.document.readyState !== "complete") {
                    if (oPow.document.readyState === "complete") break;
                }
                oPow.document.execCommand("SaveAs", true, name);
                oPow.close();
            } else {
                //禁用了window.open采用iframe下载
                var oIrame = document.createElement('iframe');
                oIrame.style.width = "0px";
                oIrame.style.height = "0px";
                oIrame.style.opacity = 1;
                document.body.appendChild(oIrame)
                oIrame.src = url;
                var IfDoc = oIrame.contentDocument || oIrame.document;
                oIrame.onreadystatechange = function () { // IE下的节点都有onreadystatechange这个事件  
                    if (oIrame.readyState == "complete") {
                        // oIrame.execCommand("SaveAs", true, name)
                        document.body.removeChild(oIrame)
                    }
                };

            }

        } else {
            if (typeof url == 'object' && url instanceof Blob) {
                url = URL.createObjectURL(url); // 创建blob地址
            }
            var aLink = document.createElement('a');
            aLink.href = url;
            aLink.setAttribute('target','_blank')
            aLink.download = name || ''; // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
            var event;
            if (window.MouseEvent) {
                event = new MouseEvent('click');
            } else {
                if (document.createEvent) {
                    event = document.createEvent('MouseEvents');
                    event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                }
            }
            aLink.dispatchEvent(event);
        }

    },
    
    //js浮点计算修复 
    operate: function (a, b, op) {
        //浮点数转换为整数 
        var toInt = function (num) {
            var rel = {};
            var str, pos, len, times;
            str = (num < 0) ? -num + '' : num + '';
            pos = str.indexOf('.');
            len = str.substr(pos + 1).length;
            times = Math.pow(10, len + 1);
            //补充：当小数位数较多时，避免出错，所以多扩大一倍，提高精度 
            rel.times = times;
            rel.num = num;
            return rel;
        }
        var d1 = toInt(a); var d2 = toInt(b);
        var max = d1.times > d2.times ? d1.times : d2.times;
        var rel;
        switch (op) {
            case "+": rel = (d1.num * max + d2.num * max) / max; break;
            case "-": rel = (d1.num * max - d2.num * max) / max; break;
            case "*": rel = ((d1.num * max) * (d2.num * max)) / (max * max); break;
            case "/": rel = (d1.num * max) / (d2.num * max); break;
        }
        return rel;
    },
    // css calc()计算函数的ie8兼容写法
    calcProfily: function (root_class, need_show_class, _resize) {
        var that = this;
        this.calcProfilyBlock(root_class, need_show_class);
        _resize && $(window).resize(function () {
            that.calcProfilyBlock(root_class, need_show_class, _resize);
        })
    },

    throttle: function (fn, delay) {
        var timer = null;
        return function (e) {
            if (timer) return;
            var context = this, Argument = arguments;
            timer = setTimeout(function () {
                fn.apply(context, Argument);
                timer = null;
            }, delay);
        }
    },
})




$(function(){

    // 回到顶部
    $(window).scroll(function(e){
        if(document.documentElement.scrollTop > 500){
            $('.to-top').show()
        }else{
            $('.to-top').hide()
        }
    })
    $('.to-top').click(function(e){
        $( "html,body").animate({ "scrollTop" : 0 }, 300);
    })

    //底部显示二维码
    $('.focus-wechat').hover(
        function (e) {
            $(this).children('.focus-qr').fadeIn(200)
        },
        function (e) {
            $(this).children('.focus-qr').fadeOut(200)
        }
    )

    //顶部显示个人中心选项
    $('.logined').hover(
        function (e) {
            $(this).children('.logined-ul').fadeIn(200)
        },
        function (e) {
            $(this).children('.logined-ul').fadeOut(200)
        }
    )

})