import config from '../../utils/config'
import api from '../../utils/api'

Page({
  data: {
    hotRecipe: [],
    recipeCate: [],
    iptValue: ''
  },
  onLoad() {
    this._getRecipeCate()
  },
  onShow() { //详情页返回时重新获取数据
    this._getHotRecipe()
  },
  async _getHotRecipe() { //获取热门菜谱 按照views排序 只需4条数据
    let res = await api.findPage(config.tables.recipeMenu, {
      status: 1
    }, 4, 1, {
      fields: 'views',
      sort: 'desc'
    })
    // console.log(res);
    let allPromise = []
    res.data.forEach((item) => { //根据菜谱的openid查询用户名称和头像
      let promise = api.findPage(config.tables.users, {
        _openid: item._openid
      })
      allPromise.push(promise)
    })
    let allUsers = await Promise.all(allPromise)
    // console.log(allUsers);

    res.data.map((item, index) => { //将用户信息添加到热门菜谱列表中
      return item.userinfo = allUsers[index].data[0].userinfo
    })

    this.setData({
      hotRecipe: res.data
    })
  },
  async _getRecipeCate() { //获取两条菜谱分类，点击跳转到对应的菜谱列表
    let res = await api.findPage(config.tables.recipeList, {}, 2, 1);
    // console.log(res);
    this.setData({
      recipeCate: res.data
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
  _goTypeList() { //点击菜谱分类跳转至typelist页面
    wx.navigateTo({
      url: '../typelist/typelist',
    })
  },
  _goRecipeDetail(e) { //点击菜谱列表项跳转至菜谱详情页
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