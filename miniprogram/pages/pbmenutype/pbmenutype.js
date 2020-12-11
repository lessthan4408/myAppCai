import config from '../../utils/config'
import api from '../../utils/api'

Page({
  data: {
    addInput: '',
    list: [],
    changeOld: '',
    changeNew: ''
  },
  onLoad() {
    this._findList()
  },
  async _findList() { //获取菜谱列表
    let res = await api.findAll(config.tables.recipeList)
    // console.log(res);
    this.setData({
      list: res.data
    })
  },
  _addInput(e) { //菜谱添加失焦事件处理函数
    // console.log(e.detail.value);
    this.setData({
      addInput: e.detail.value
    })
  },
  async _add() { //菜谱添加点击添加按钮
    let typeName = this.data.addInput

    if (typeName.trim() == "") {
      wx.showToast({
        title: '请输入菜谱名',
        icon: 'none'
      })
      return
    }
    let hasRecipe = this.data.list.findIndex((item) => {
      return item.typeName == typeName
    }) == -1 ? false : true

    if (!hasRecipe) { //没有相同的菜谱名
      let res = await api.add(config.tables.recipeList, {
        typeName
      })
      // console.log(res);
      if (res._id) {
        this.setData({
          addInput: ''
        })
      }
    } else { //有相同的菜谱名
      wx.showToast({
        title: '请勿添加重复的菜谱',
        icon: 'none'
      })
      this.setData({
        addInput: ''
      })
    }
    this._findList()
  },
  _change1(e) { //菜谱修改信息
    console.log(e.currentTarget.dataset);
    let {
      listid,
      typename
    } = e.currentTarget.dataset;
    this.setData({
      id: listid, //此id不用渲染，用来区别点击的哪一条数据
      changeOld: typename
    })

  },
  _setChangeNew(e) { //设置改变后的新值
    this.setData({
      changeNew: e.detail.value
    })
  },
  async _change2() { //点击修改按钮
    let res = await api.update(config.tables.recipeList, this.data.id, {
      typeName: this.data.changeNew
    })
    console.log(res);
    if (res.stats) {
      wx.showToast({
        title: '修改成功',
        icon: 'none'
      })
    }
    this._findList()
  },
  _del(e) { //菜谱删除信息
    // console.log(e.currentTarget.dataset.listid);
    wx.showModal({
      content: '确定删除吗?',
       success:async(res)=> {
        if (res.confirm) {
          let res = await api.del(config.tables.recipeList, e.currentTarget.dataset.listid)
          // console.log(res);
          this._findList();
        }
      }
    })
  }
})