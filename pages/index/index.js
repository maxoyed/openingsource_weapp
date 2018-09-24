var Api = require('../../utils/api.js');
var Request = require('../../utils/request.js');
import config from '../../utils/config.js';
const app = getApp();

Page({
    data: {
        current_tab: '0',
        page: 1
    },

    onReady: function(options) {
        this.getCardNews();
    },

    // tab切换
    switchTab: function(e) {
        let current_tab = e.currentTarget.dataset.current_tab;
        this.setData({
            current_tab: current_tab,
            page: 1,
            keyword: null
        });
        if(current_tab <= 1){
            this.getCardNews();
        } else {
            this.getNewsList();
        }
    },

    // 新闻数据源切换
    switchNewsApi: function(current_tab, keyword=null){
      console.log(keyword)
        if(keyword){
          let page = this.data.page;
          return Api.searchPosts(keyword, page)
        } else {
          switch (current_tab) {
            case '0':
              var request_api = Api.getRecentlyPostsByCategory(config.getDailyNewsID, 1);
              break;
            case '1':
              var request_api = Api.getRecentlyPostsByCategory(config.getWeeklyNewsID, 1);
              break;
            case '2':
              var page = this.data.page;
              var request_api = Api.getRecentlyPostsByCategory(config.getActivityNewsID, config.getPageLimit, page);
              break;
            case '3':
              var page = this.data.page;
              var request_api = Api.getRecentlyPosts(page);
              break;
          }
        }
        return request_api;
    },


    // 获取日报/周报数据
    getCardNews: function (){
        let current_tab = this.data.current_tab;
        wx.showLoading({
            title: '加载中',
            mask: true
        });
        Request.get(this.switchNewsApi(current_tab))
            .then(res => {
                console.log(res);
              
              let excerpt = res.data[0].excerpt.rendered || ''
                var news_data = {
                    id: res.data[0].id,
                    featured_media: res.data[0].featured_media || 0,
                    title: res.data[0].title.rendered || '',
                  excerpt: app.towxml.toJson(excerpt, 'html'),
                  cover_image: res.data[0].post_large_image
                }
                this.setData({
                    news_data: news_data
                });
                wx.hideLoading()
            })
            .catch(err => {
                console.log(err);
            });
    },

    // 获取新闻列表
    getNewsList: function(keyword=null){
      if (typeof (keyword) == "object"){
        keyword = null;
      }
        // 显示加载
        let current_tab = this.data.current_tab;
        let page = this.data.page;
        let keyword_storage = this.data.keyword;
        if(!keyword){
          keyword = keyword_storage;
        }
        wx.showLoading({
            title: '正在加载',
            mask: true
        });
        Request.get(this.switchNewsApi(current_tab, keyword))
            .then(res => {
              try{
                if(res.data.data.status == 400) {
                  wx.hideLoading();
                  wx.showToast({
                    title: '到底了哟～',
                    icon: 'none',
                    mask: true
                  })
                }
              }
              catch(error){
                console.log(error);
                if (page == 1) {
                  var news_list = [];
                } else {
                  var news_list = this.data.news_list;
                }
                for (var id in res.data) {
                  var post = res.data[id];
                  console.log(post);
                  news_list.push({
                    id: post.id,
                    cover_image: post.content_first_image,
                    title: post.title.rendered || '',
                    date: post.date,
                    pageviews: post.pageviews,
                    total_comments: post.total_comments
                  });
                }
                this.setData({
                  news_list: news_list
                });
                // 加载完成隐藏loading状态
                wx.hideLoading();
              }
                
            })
            .catch(err => {
                console.log(err);
            });
        this.setData({
            page: page + 1
        });
    },

    // 跳转详情页
    goToDetail: function(e){
        let posts_id = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '../article/index?posts=' + posts_id,
            success: function(res){
                wx.showLoading({
                    title: '加载中',
                    fail: function (res) {
                        console.log(res);
                    }
                });
            },
            fail: function(res) {
                console.log(res);
            },
        });
    },

    // 搜索
  search: function(e){
    let keyword = e.detail.value
    if(keyword){
      this.setData({
        page:1,
        keyword: keyword
      });
      this.getNewsList(keyword);
    }
    else {
      wx.showToast({
        title: '搜索内容不能为空哦',
        icon: 'none'
      })
    }
  },

    // 下拉刷新
    onPullDownRefresh: function(){
        let current_tab = this.data.current_tab;
        if (current_tab <= 1){
            console.log(current_tab);
            this.getCardNews(current_tab);
        } else {
            this.setData({
                page: 1,
                keyword: null
            });
            this.getNewsList();
        }
        wx.stopPullDownRefresh();
    },
    
    // 分享
    onShareAppMessage: function(e){
        return {
            title: this.data.news_data.title,
            path: 'pages/article/index?posts=' + this.data.news_data.id,
            imageUrl: this.data.news_data.cover_image
        }
    }
})