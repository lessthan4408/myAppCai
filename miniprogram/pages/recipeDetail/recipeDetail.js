import config from '../../utils/config'
import api from '../../utils/api'

const _ = api.db.command//数据库字段自增自减时使用

Page({
  data: {
    recipeDetail: {},
    isFollows: false,
  },
  onLoad(options) {
    let {
      recipeId,
      title
    } = options
    this.data.recipeId = recipeId //后面需要频繁用到recipeid
    wx.setNavigationBarTitle({
      title
    })
    this._getRecipeDetail()
  },
  async _getRecipeDetail() {
    //1. 通过菜谱id获取菜谱详情
    let res = await api.findAll(config.tables.recipeMenu, {
      _id: this.data.recipeId
    })
    // console.log(res);

    //2. 通过菜谱详情中的openid获取用户数据
    let user = await api.findAll(config.tables.users, {
      _openid: res.data[0]._openid
    })
    // console.log(user);
    res.data[0].userinfo = user.data[0].userinfo

    //3. 每次加载该页面更新views数量
    let ress = await api.update(config.tables.recipeMenu, this.data.recipeId, {
      views: _.inc(1)
    })
    // console.log(ress);
    res.data[0].views++

    //4. 进入菜谱详情页判断是否关注
    let isFollows = await api.findAll(config.tables.recipeFollows, {
      _openid: wx.getStorageSync('openid'),
      recipeId:this.data.recipeId
    })
    // console.log(isFollows);
    if(isFollows.data.length<=0) {//未关注
      this.setData({
        isFollows:false
      })
    } else {//已关注
      this.setData({
        isFollows:true
      })
    }
    this.setData({
      recipeDetail: res.data[0]
    })
  },
  async _doFollows() { //处理是否关注
    //判断是否登录
    let isLogin = wx.getStorageSync("openid") ? true : false
    if (isLogin) { //已登录
      if (!this.data.isFollows) { //关注
        let res = await api.add(config.tables.recipeFollows, {
          recipeId: this.data.recipeId
        })
        // console.log(res);
        if (res._id) {
          wx.showToast({
            title: '关注成功',
          })
          this.setData({
            isFollows: true
          })
          await api.update(config.tables.recipeMenu,this.data.recipeId,{follows: _.inc(1)})
          // this.data.recipeDetail.follows++
        }
      } else { //取消关注
        let res = await api.delWhere(config.tables.recipeFollows, {
          _openid: wx.getStorageSync("openid"),
          recipeId: this.data.recipeId
        })
        // console.log(res);
        if (res.stats) {
          this.setData({
            isFollows: false
          })
          await api.update(config.tables.recipeMenu,this.data.recipeId,{follows: _.inc(1)})
          // this.data.recipeDetail.follows--
        }
      }
    } else { //未登录
      wx.showToast({
        title: '请登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.switchTab({
          url: '../personal/personal',
        })
      }, 1500)
    }
  },
  onShareAppMessage() {
    //分享给朋友
  },
  onShareTimeline() {
    //分享到朋友圈
  }
})