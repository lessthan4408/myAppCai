import config from '../../utils/config'
import api from '../../utils/api'

Page({
  data:{
    radioList:[],
    files:[]
  },
  onLoad() {
    this.findList()
  },
  async _submit(e) {//点击发布按钮
    let fields = await this._uploadFiles(this.data.files)//数据库中的图片信息需要在本地存储中
    fields = fields.map((item)=>{
      return item.fileID
    })
    let data = {//上传到数据库的数据
      ...e.detail.value,
      follows:0,
      views:0,
      status:1,
      time:new Date().getTime(),
      fields
    }
    // console.log(data);
    let res = await api.add(config.tables.recipeMenu,data)
    // console.log(res);
    if(res._id) {
      wx.showToast({
        title: '发布成功',
      })
     setTimeout(function() {
      wx.navigateBack({//发布后返回我的页面
        delta: 1,
      })
     },1500)
    }
    
  },
  async findList() {//获取单选框列表
    let res = await api.findAll(config.tables.recipeList)
    // console.log(res);
    this.setData({
      radioList:res.data
    })
  },
  _bindselect(e) {//图片选择时触发
    // console.log(e);
    let files = e.detail.tempFilePaths.map((item)=>{
      return {url:item}
    })
    // console.log(files);
    files = this.data.files.concat(files)//第二次添加
    this.setData({
      files
    })
    
  },
  _binddelete(e) {//图片删除时触发
    // console.log(e);
    this.data.files.splice(e.detail.index,1)
  },
  _uploadFiles(files) {//点击发布按钮多图上传到云端存储
    // console.log(files);
    
    let allPromise = []
    files.forEach((item,index)=>{
      let extName = item.url.split('.').pop()
      let fileName = new Date().getTime() + index + '.' + extName
      let promise = wx.cloud.uploadFile({
        cloudPath:'cai-recipes/' + fileName,
        filePath:item.url
      })
      allPromise.push(promise)
    })

    return Promise.all(allPromise)
  }
})