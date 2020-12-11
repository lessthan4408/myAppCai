import config from '../../utils/config'
import api from '../../utils/api'

Page({
  data:{
    recipeList:[],
    page:1,
    tip:false,
    tips:false
  },
  onLoad(options) {
    // console.log(options);
    let {type,title,id} = options

    this.data.type = type //后面判断数据来源需要用到
    this.data.id=id //普通跳转需要通过类型id获取菜谱列表
    this.data.title = title //搜索跳转通过ipt模糊搜索菜谱列表

    wx.setNavigationBarTitle({
      title
    })
    this._getRecipeList()
  },
  async _getRecipeList() {//获取根据进入场景获取菜谱列表
    let type = this.data.type
    let where={},orderBy={fields:'_id',sort:'asc'}
    if(type == 'normal') {//普通跳转
      where={
        status:1,
        recipeTypeid:this.data.id
      }
    } else if (type == 'recom') {//推荐跳转
      where={
        status:1
      }
      orderBy={
        fields:'follows',
        sort:'desc'
      }
    } else if (type == 'hot') {//热门跳转
      where={
        status:1
      }
      orderBy={
        fields:'views',
        sort:'desc'
      }
    } else {//搜索跳转
      where={
        status:1,
        recipeName:api.db.RegExp({
          regexp:this.data.title||'',
          options:'i'
        })
      }
    }
    let res = await api.findPage(config.tables.recipeMenu,where,5,this.data.page,orderBy);

    //控制屏幕下端提示信息的显示
    if(res.data.length<=0&&this.data.page==1) {
      this.setData({
        tip:true
      })
    }
    if(res.data.length<5&&this.data.page!=1) {
      this.setData({
        tips:true
      })
    }

    // console.log(res);
    let allPromise = []
    res.data.forEach((item)=>{
      let promise = api.findAll(config.tables.users,{_openid:item._openid})
      allPromise.push(promise)
    })
    let allUsers = await Promise.all(allPromise)
    // console.log(allUsers);
    res.data.map((item,index)=>{
      return item.userinfo = allUsers[index].data[0].userinfo
    })

    res.data = this.data.recipeList.concat(res.data)//下拉后重新请求的数据需要拼到原来数据后

    this.setData({
      recipeList:res.data
    })
  },
  _goRecipeDetail(e) { //点击菜谱项至菜谱详情页
    let {
      id,
      title
    } = e.currentTarget.dataset
    // console.log(id,title);
    wx.navigateTo({
      url: `../recipeDetail/recipeDetail?recipeId=${id}&title=${title}`,
    })
  },
  onReachBottom() {
    this.data.page++
    this._getRecipeList()
  }
})