import config from '../../utils/config'
import api from '../../utils/api'

Page({
  data:{
    typeList:[],
    iptValue:''
  },
  onLoad() {
    this._getTypeList()
  },
  async _getTypeList() {
    let res = await api.findAll(config.tables.recipeList);
    // console.log(res);
    this.setData({
      typeList:res.data
    })
  },
  _goRecipeList(e) { //通过分类导航、热门菜谱或搜索进入相应的菜谱列表
    let {
      type,
      title,
      id
    } = e.currentTarget.dataset
    // console.log(type,title,id);
    wx.navigateTo({
      url: `../recipelist/recipelist?type=${type}&title=${title}&id=${id}`,
    })

    //将搜索内容存入本地存储中 需要在近期搜索中渲染
    let search = wx.getStorageSync('search') || []
    let findIndex = search.findIndex((item) => {
      return item == title
    })
    // console.log(findIndex);
    if (findIndex !=-1) { //search中存在
      search.splice(findIndex, 1)
    }
    search.unshift(title)
    wx.setStorageSync('search', search)

    this.setData({
      iptValue: ''
    })
  },
  _input(e) { //获取搜索输入框的值
    // console.log(e.detail.value);
    this.setData({
      iptValue: e.detail.value
    })
  },
  _goRecipeList(e) { //通过分类导航、热门菜谱或搜索进入相应的菜谱列表
    let {
      type,
      title,
      id
    } = e.currentTarget.dataset
    // console.log(type,title,id);
    wx.navigateTo({
      url: `../recipelist/recipelist?type=${type}&title=${title}&id=${id}`,
    })

    //将搜索内容存入本地存储中 需要在近期搜索中渲染
    let search = wx.getStorageSync('search') || []
    let findIndex = search.findIndex((item) => {
      return item == title
    })
    // console.log(findIndex);
    if (findIndex !=-1) { //search中存在
      search.splice(findIndex, 1)
    }
    search.unshift(title)
    wx.setStorageSync('search', search)

    this.setData({
      iptValue: ''
    })
  },
})