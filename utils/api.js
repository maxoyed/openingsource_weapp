import config from 'config.js'

var host_url = config.getHostUrl;
var host_url_watch = config.getHostUrlWatch;
var page_limit = config.getPageLimit;
module.exports = {
    //获取最新的N篇文章
    getRecentlyPosts: function(page){
      return `${host_url}posts?page=${page}&per_page=${page_limit}`;
    },
    //通过分类获取最新的N篇文章
    getRecentlyPostsByCategory: function(category, page_limit, page=1){
      return `${host_url}posts?categories=${category}&per_page=${page_limit}&page=${page}`;
    },
    // 通过id获取文章数据
    getPostsByID: function(id){
        return host_url + 'posts/' + id;
    },
    // 通过id获取评论数据
    getCommentsByID: function(id, page){
        return host_url_watch + 'comment/getcomments?postid=' + id + '&limit=10&page=' + page + '&order=desc'
    },
    // 搜索文章
    searchPosts: function(keyword, page){
      return `${host_url}posts?search=${keyword}&page=${page}`
    }
}