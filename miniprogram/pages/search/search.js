import config from '../../utils/config'
import api from '../../utils/api'

Page({
  data:{
    iptValue:'',
    hotSearch:[],
    recentSearch:[]
  },
  onLoad() {
    this._getHotSearch()
  },
  onShow() {
    this._getRecentSearch()
  },
  _input(e) { //获取搜索输入框的值
    // console.log(e.detail.value);
    this.setData({
      iptValue: e.detail.value
    })
  },
  _goRecipeList(e) { //点击搜索进入相应的菜谱列表
    let {
      type,
      title,
      id
    } = e.currentTarget.dataset
    // console.log(type,title,id);
    wx.navigateTo({
      url: `../recipelist/recipelist?type=${type}&title=${title}&id=${id}`,
    })
    this.setData({
      iptValue: ''
    })

    //将搜索内容存入本地存储中
    let search = wx.getStorageSync('search') || []
    let findIndex = search.findIndex((item)=>{
      return item == title
    })
    // console.log(findIndex);
    if(findIndex!=-1){//search中存在
      search.splice(findIndex,1)
    }
    search.unshift(title)
    wx.setStorageSync('search',search)
  },
  _getRecentSearch() {//获取最近搜索列表
    this.setData({
      recentSearch:wx.getStorageSync('search')
    })
  },
  async _getHotSearch() {//根据views获取热门搜索列表
    let res = await api.findPage(config.tables.recipeMenu,{},6,1,{fields:'views',sort:'desc'})
    console.log(res);
    this.setData({
      hotSearch:res.data
    })
    
  },
  _goRecipeDetail(e) { //点击热门搜索项跳转至菜谱详情页
    let {
      id,
      title
    } = e.currentTarget.dataset
    // console.log(id,title);
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?recipeId=${id}&title=${title}`,
    })
  }
})