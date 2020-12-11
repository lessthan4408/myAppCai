import config from '../../utils/config'
import api from '../../utils/api'

Page({
  data: {
    isLogin: false,
    userinfo: {},
    curIndex: 0,
    myRecipe: [],
    myType:[],
    myFollow:[]
  },

  onLoad() {
    this._checkSession()
  },

  onShow() {
    this._getTabCon()
  },

  _checkSession() { //检测是否登录
    wx.checkSession({
      success: () => {
        // console.log('已登录');
        this.setData({
          isLogin: true,
          userinfo: wx.getStorageSync('userinfo')
        })
      },
      fail: () => {
        // console.log('未登录');
        wx.showToast({
          title: '请登录',
          icon: 'none'
        })
        this.setData({
          isLogin: false
        })
      }
    })
  },

  _login(e) { //点击登录按钮
    // console.log(e);
    let that = this

    //1. 拒绝授权
    if (e.detail.errMsg == "getUserInfo:fail auth deny") {
      wx.showToast({
        title: '请登录',
        icon: "none"
      })
      return
    }

    //2. 允许授权
    wx.login({
      success() {
        let userinfo = e.detail.userInfo
        // console.log(userinfo);

        //使用云函数获取标识唯一用户的openid
        wx.cloud.callFunction({
          name: 'openid',
          async success(res) {
            // console.log(res);
            let openid = res.result.openid
            let isAdmin = openid == config.isAdmin ? true : false

            wx.setStorageSync('isAdmin', isAdmin)
            wx.setStorageSync('userinfo', userinfo)
            wx.setStorageSync('openid', openid)

            //判断数据库中是否存在该用户,若存在则不再添加
            let ress = await api.findAll(config.tables.users)
            // console.log(ress);

            //find返回该元素,findIndex返回下标
            let hasOpenid = ress.data.findIndex((item) => {
              return item._openid == openid
            }) == -1 ? false : true
            // console.log(hasOpenid);
            if (!hasOpenid) {
              //添加用户信息至数据库
              await api.add(config.tables.users, {
                userinfo
              })
            }

            that.setData({
              userinfo,
              isLogin: true
            })
          }
        })
      }
    })
  },

  _adminMenu() { //管理员点击头像显示菜谱管理页面
    if (wx.getStorageSync('isAdmin')) {
      wx.navigateTo({
        url: '../pbmenutype/pbmenutype',
      })
    }
  },

  toForm() { //跳转到表单添加页面
    wx.navigateTo({
      url: '../pbmenu/pbmenu',
    })
  },

  _changeCurIndex(e) { //tab栏切换改变curIndex
    // console.log(e.currentTarget.dataset.index);
    let that = this
    this.setData({
      curIndex: e.currentTarget.dataset.index
    }, function () { //，每次切换时获取对应tab项的数据
      that._getTabCon()
    })
  },

  _getTabCon() { //根据curIndex判断获取整个tab的内容
    if (this.data.curIndex == 0) {
      this._getRecipeCon()
    } else if (this.data.curIndex == 1) {
      // console.log('获取菜谱数据');
      this._getMyType()
    } else {
      // console.log('获取关注数据');
      this._getMyFollows()
    }
  },

  async _getRecipeCon() { //切换或者显示时获取我发布的菜单项的内容
    let data = {
      _openid: wx.getStorageSync('openid'), //根据当前登录用户获取
      status: 1
    }
    let res = await api.findAll(config.tables.recipeMenu, data, {
      fields: 'time',
      sort: 'desc'
    })
    // console.log(res);
    this.setData({
      myRecipe: res.data
    })

  },

  async _delMyRecipe(e) { //删除我的菜谱项 将status改为2
    let res = await api.update(config.tables.recipeMenu, e.currentTarget.dataset.id, {
      status: 2
    })
    // console.log(res);
    if (res.stats) {
      wx.showToast({
        title: '删除成功',
      })
    }
    this._getRecipeCon()
  },
  async _getMyType() { //获取我所发布菜谱的分类
    let res = this.data.myRecipe
    res =Array.from(new Set(res.map((item)=>{
      return item.recipeTypeid
    })))
    // console.log(res)
    let allPromise = []
    res.forEach((item)=>{
      let promise = api.findAll(config.tables.recipeList,{_id:item})
      allPromise.push(promise)
    })
    let myType = await Promise.all(allPromise)
    // console.log(myType);
    this.setData({
      myType
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
  async _getMyFollows() {
    let res = await api.findAll(config.tables.recipeFollows,{_openid:wx.getStorageSync('openid')})
    // console.log(res);
    let allPromise = []
    res.data.forEach((item)=>{
      let promise = api.findAll(config.tables.recipeMenu,{_id:item.recipeId})
      allPromise.push(promise)
    })
    let myFollow = await Promise.all(allPromise)
    console.log(myFollow);
    this.setData({
      myFollow
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