// pages/news/detail/index.js
var WxParse = require('../../wxParse/wxParse.js');
var Api = require('../../utils/api.js');
var Request = require('../../utils/request.js');
import config from '../../utils/config.js';
Page({

    // 页面的初始数据
    data: {
        page: 1
    },
    // 生命周期函数--监听页面加载
    onLoad: function(options) {
        var that = this;
        console.log(options);
        Request.get(Api.getPostsByID(options.posts))
            .then(res => {
                try {
                    var title = /开源.*报.*/.exec(res.data.title.rendered)[0];
                }
                catch(err) {
                    console.log(err);
                    var title = res.data.title.rendered;
                }
                console.log(res.data);
                this.setData({
                    title: title,
                    id: res.data.id,
                    date: res.data.date,
                    content: res.data.content.rendered,
                    pageviews: res.data.pageviews,
                    total_comments: res.data.total_comments,
                    cover_image: res.data.content_first_image
                });
                wx.setNavigationBarTitle({
                    title: res.data.title.rendered,
                    fail: function(res) {
                        console.log("小程序标题设置失败：", res);
                    }
                });
                wx.hideLoading();
            })
            .then(() => {
                WxParse.wxParse('article', 'html', this.data.content, that, 5);
            })
            .catch(err => {
                console.log(err);
            });
    },

    // 获取评论数据
    getComments: function() {
        let id = this.data.id;
        let page = this.data.page;
        Request.get(Api.getCommentsByID(id, page))
            .then(res => {
                console.log(res.data);
            })
            .catch(err => {
                console.log(err);
            });
    },

    //给a标签添加跳转和复制链接事件
    wxParseTagATap: function(e) {
        var self = this;
        var href = e.currentTarget.dataset.src;
        console.log(href);
        wx.setClipboardData({
            data: href,
            success: function(res) {
                wx.getClipboardData({
                    success: function(res) {
                        wx.showToast({
                            title: '链接已复制',
                            duration: 2000
                        })
                    }
                })
            }
        })
    },

    // 返回首页
    navToHome: function(){
        wx.redirectTo({
            url: '../index/index',
            fail: function(res) {
                console.log(res);
            }
        })
    },

    // 用户点击右上角分享
    onShareAppMessage: function() {
        return {
            title: this.data.title,
            path: 'pages/article/index?posts=' + this.data.id,
            imageUrl: this.data.cover_image
        }
    }
})