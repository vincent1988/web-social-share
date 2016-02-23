/**
 * Created by vincent on 16/2/23.
 */
var loginState = false;   //模拟登陆
//分享
var share = {
    param: {
        webid: '',
        name: '',
        title: document.title,
        url: window.location.href,
        pic: '',
        content: ''
    },
    //初始化
    init: function () {
        share.popup();
        share.login();
        share.sina();
        share.qzone();
        share.tqq();

        $('#share_popup_login_wb').click(function () {
            !WB2.checkLogin() && alert('<b>新浪微博登录弹窗有可能被浏览器拦截，请手动允许弹出窗口。</b>')
        });
        $('.share-box a, .share-ico32 a, .share-ico20 a, .share-ico16 a, #share_copy, #share_sina, #share_qzone, #share_qq').click(function () {
            var _this = $(this),
                _do = function () {
                    if (_this.hasClass('copy') || _this.attr('id') == 'share_copy') {
                        if (window.clipboardData) {
                            window.clipboardData.setData('text', share.param.title + '　' + share.param.url);
                            alert('<b>复制成功</b>！<br />请粘贴到你的QQ/MSN上推荐给你的好友。')
                        } else {
                            alert('<b>非IE浏览器请手动复制以下内容</b>：<br />' + share.param.title + '　' + share.param.url)
                        }
                    } else {
                        if (_this.hasClass('qzone') || _this.attr('id') == 'share_qzone') {
                            share.param.webid = 'qzone ';
                            share.param.name = 'QQ空间';
                            share.popup_login_wb.hide();
                            share.popup_submit_wb.hide();
                            share.popup_login_tx.hide();
                            share.popup_submit_tx.hide();
                            share.popup_login_qq.show();
                            share.popup_submit_qq.show()
                        } else if (_this.hasClass('tqq') || _this.attr('id') == 'share_qq') {
                            share.param.webid = 'tqq';
                            share.param.name = '腾讯微博';
                            share.popup_login_wb.hide();
                            share.popup_submit_wb.hide();
                            share.popup_login_tx.show();
                            share.popup_submit_tx.show();
                            share.popup_login_qq.hide();
                            share.popup_submit_qq.hide()
                        } else if (_this.hasClass('tsina') || _this.attr('id') == 'share_sina') {
                            share.param.webid = 'tsina';
                            share.param.name = '新浪微博';
                            share.popup_login_wb.show();
                            share.popup_submit_wb.show();
                            share.popup_login_tx.hide();
                            share.popup_submit_tx.hide();
                            share.popup_login_qq.hide();
                            share.popup_submit_qq.hide()
                        }
                        share.popup.reset();
                        share.popup_div.popShow('分享到' + share.param.name)
                    }
                },
                _parent = _this.parent(),
                _title = _parent.attr('tit'),
                _url = _parent.attr('url'),
                _pic = _parent.attr('pic'),
                _content = _parent.attr('content');
            _title != undefined && _title != '' && (share.param.title = _title);
            _url != undefined && _url != '' && (share.param.url = _url.toLowerCase().indexOf('http') > -1 ? _url : 'http://' + window.location.host + _url + (login.info.UserID ? '?uid=' + login.info.UserID : ''));
            _pic != undefined && _pic != '' && (share.param.pic = _pic.toLowerCase().indexOf('http') > -1 ? _pic : 'http://' + window.location.host + _pic);
            _content != undefined && _content != '' && (share.param.content = _content);
            if (loginState) {
                _do()
            } else {
                share.login_box.popShow("登录后分享送积分");
                share.login_ignore.unbind('click').click(function () {
                    share.login_box.popHide();
                    _do()
                })
            }
        })
    },
    sina: function () {
        WB2.anyWhere(function (W) {
            W.widget.connectButton({
                id: "share_popup_login_wb",
                type: "3,5",
                callback: {
                    login: function (o) {
                        share.popup_submit_wb.unbind('click').click(function () {
                            W.parseCMD("/statuses/upload_url_text.json", function (sResult, bStatus) {
                                if (bStatus == true) {
                                    share.success()
                                } else {
                                    if (sResult.error_code == 20019 || sResult.error_code == 20111) {
                                        share.error('请不要重复分享！')
                                    } else if (sResult.error_code == 20016) {
                                        share.error('分享过于频繁！')
                                    } else if (sResult.error_code == 10022 || sResult.error_code == 10023) {
                                        share.error('新浪接口繁忙，请分享到QQ空间或腾讯微博。')
                                    } else {
                                        share.error('新浪接口繁忙，请分享到QQ空间或腾讯微博。')
                                    }
                                }
                            }, {
                                'status': share.param.title + '　' + share.param.url,
                                'url': share.param.pic
                            })
                        }).removeClass('dis')
                    },
                    logout: function () {
                        share.popup_submit_wb.unbind('click').addClass('dis')
                    }
                }
            })
        })
    },
    qzone: function () {
        QC.Login({
            btnId: "share_popup_login_qq"
        }, function (reqData, opts) {
            var dom = document.getElementById(opts['btnId']);
            dom && (dom.innerHTML = QC.String.format(['<span>{nickname}</span>', '<span><a href="javascript:QC.Login.signOut();">退出</a></span>'].join(""), {
                nickname: QC.String.escHTML(reqData.nickname),
                figureurl: reqData.figureurl
            }));
            share.popup_submit_qq.unbind('click').click(function () {
                QC.api("add_share", {
                    title: share.param.title,
                    //summary: (share.param.content != undefined && share.param.content != '') ? share.param.content : share.param.title,
                    url: share.param.url,
                    images: share.param.pic
                }).success(function (s) {
                    share.success()
                }).error(function (f) {
                    share.error('QQ空间接口繁忙，请分享到新浪或腾讯微博。')
                })
            }).removeClass('dis')
        }, function () {
            share.popup_submit_qq.unbind('click').addClass('dis')
        })
    },
    tqq: function () {
        T.init({
            appkey: 你的APPKEY
        });
        var _loginBtn = $('<a href="javascript:;" style="display:none;">登录到腾讯微博</a>').appendTo($("#share_popup_login_tx")).click(function () {
                T.login(function (loginStatus) {
                    _login(loginStatus)
                }, function (error) {
                })
            }),
            _name = $('<span style="display:none;"></span>').appendTo($("#share_popup_login_tx")),
            _logoutBtn = $('<a href="javascript:;" style="display:none;margin-left:5px;">退出</a>').appendTo($("#share_popup_login_tx")).click(function () {
                T.logout(function () {
                    _logout()
                })
            }),
            _login = function (loginStatus) {
                _name.show().text(loginStatus.nick);
                _logoutBtn.show();
                _loginBtn.hide();
                share.popup_submit_tx.unbind('click').click(function () {
                    T.api("/t/add_pic_url", {
                        "content": share.param.title + '　' + share.param.url,
                        "pic_url": share.param.pic,
                        "clientip": "",
                        "longitude": "",
                        "latitude": "",
                        "syncflag": "0"
                    }, "json", "post").success(function (response) {
                        share.success()
                    }).error(function (code, message) {
                        share.error('腾讯微博接口繁忙，请分享到新浪或QQ空间。')
                    })
                }).removeClass('dis')
            },
            _logout = function () {
                _name.hide().text('');
                _logoutBtn.hide();
                _loginBtn.show();
                share.popup_submit_tx.unbind('click').addClass('dis')
            };
        T.tokenReady(function () {
            if (T.loginStatus()) {
                _login(T.loginStatus())
            } else {
                _logout()
            }
        })
    },
    error: function (s) {
        alert(s || '分享失败！')
    },
    success: function () {
        alert('分享成功！', 1000);
        share.popup_div.popHide();
        share.post()
    },
    //登录用户，记录日志
    post: function () {
        if (loginState) {
            alert("登录用户，记录日志，赠送积分！");
        }
    },
    popup: function () {
        share.popup_div = $('<div id=\"share_popup\"></div>').appendTo('body');
        share.popup_form = $('<div id=\"share_popup_form\"></div>').appendTo(share.popup_div);
        share.popup_msg = $('<div id=\"share_popup_msg\" class=\"g-c-r g-fw-b\"></div>').appendTo(share.popup_div);
        var top = $('<div class=\"top\"></div>').appendTo(share.popup_form),
            mid = $('<div class=\"mid\"></div>').appendTo(share.popup_form),
            bot = $('<div class=\"bot\"></div>').appendTo(share.popup_form);
        share.popup_login_qq = $('<span id=\"share_popup_login_qq\"></span>').appendTo(top);
        share.popup_login_wb = $('<span id=\"share_popup_login_wb\"></span>').appendTo(top);
        share.popup_login_tx = $('<span id=\"share_popup_login_tx\"></span>').appendTo(top);
        share.popup_img = $('<img id=\"share_popup_img\" src=\"/images/common/transparent.png\" onerror=\"noPic(this)\" />').appendTo(mid);
        share.popup_text = $('<textarea id=\"share_popup_text\" cols=\"20\" rows=\"3\"></textarea>').appendTo(mid);
        share.popup_submit_qq = $('<a class=\"dis\" id=\"share_popup_submit_qq\">分享到QQ空间</a>').appendTo(bot);
        share.popup_submit_wb = $('<a class=\"dis\" id=\"share_popup_submit_wb\">分享到新浪微博</a>').appendTo(bot);
        share.popup_submit_tx = $('<a class=\"dis\" id=\"share_popup_submit_tx\">分享到腾讯微博</a>').appendTo(bot);
        share.popup.reset = function () {
            share.popup_form.show();
            share.popup_msg.hide();
            share.popup_img.attr('src', share.param.pic);
            share.popup_text.val(share.param.title + '　' + share.param.url)
        }
    },
    login: function () {
        share.login_box = $('<div style=\"width:240px;padding:20px 0;display:none;text-align:center;\"></div>').appendTo('body');
        share.login_link = $('<a class=\"g-btn\">马上登录</a>').appendTo(share.login_box).click(function () {
            share.login_box.popHide();
            loginState = true;
            alert("模拟登陆成功");
        });
        share.login_ignore = $('<a class=\"g-btn g-ml-10\">继续分享</a>').appendTo(share.login_box)
    }
};

//弹出层
$.fn.popShow = function (title) {
    var tag = this;
    $('<div class=\"g-mask\"><iframe frameborder=\"0\" scrolling=\"no\"></iframe></div>').appendTo('body');
    this.show().attr('par', this.parent().length ? true : false).appendTo('body').wrapAll('<table class=\"g-popup\"><tr><td></td></tr></table>');
    this.wrapAll('<div class=\"g-popup-wrap\" style=\"width:' + this.outerWidth(true) + 'px\"></div>').before('<div class=\"g-popup-title g-line-dashed\">' + (title ? title : '') + '</div>').before($('<a class=\"g-popup-hide\" href=\"javascript:;\">关闭</a>').click(function () {
        tag.popHide()
    }));
    return this
};
$.fn.popHide = function () {
    var tab = this.closest('table');
    this.attr('par') == 'true' ? this.hide().appendTo('body') : this.remove();
    tab.prev().remove();
    tab.remove();
    return this
};