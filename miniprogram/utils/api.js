const db = wx.cloud.database()

const add =(collectionName,data={})=>{//数据库添加api
  return db.collection(collectionName).add({data})
}

const findAll = async (collectionName,data={},orderBy={fields:'_id',sort:'asc'})=>{//小程序端一次最多只能获取20条数据，云端一次最多只能获取100条数据
  const MAX_LIMIT = 100
  // 先取出集合记录总数
  const countResult = await db.collection(collectionName).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection(collectionName).where(data).orderBy(orderBy.fields,orderBy.sort).skip(i * MAX_LIMIT).limit(MAX_LIMIT).get()
    tasks.push(promise)
  }

  //如果该表为空,则task为空
  if((await Promise.all(tasks)).length==0) {
    return {
      data:[]
    }
  }

  // 等待所有
  return (await Promise.all(tasks)).reduce((acc, cur) => {
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  })
}

const findPage = (collectionName,data={},limit=5,page=1,orderBy={fields:'_id',sort:'asc'})=>{//查询数据处理分页
  let skip = (page-1)*limit
  return db.collection(collectionName).where(data).limit(limit).skip(skip).orderBy(orderBy.fields,orderBy.sort).get()
}

const update=(collectionName,_id,data={})=>{//更新数据字段
  return db.collection(collectionName).doc(_id).update({data})
}

const del = (collectionName,_id)=>{
  return db.collection(collectionName).doc(_id).remove()
}

const delWhere=(collectionName,where)=>{
  return db.collection(collectionName).where(where).remove()
}

export default {
  add,
  findAll,
  findPage,
  update,
  del,
  delWhere,
  db
}