// Express专门提供了一种更好的方式
// 专门用来提供路由的
var express = require('express');
// 1 创建一个路由容器
var router = express.Router();
var mysql = require('mysql')
// 2 把路由都挂载到路由容器中


const conn = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'888888',
    database:'car'
})
//登陆
router.post('/login', function(req, res) {
    const sqlStr = 'select * from user '
    conn.query(sqlStr,(err,result)=>{
        const flag = result.some(item => {
            if(item.username === req.body.username && item.password === req.body.password){
                return true
            }
            else{
                return false
            }
        })
        if(flag){
            if(req.body.username === 'admin'){
                return res.json({status:200,message:'登陆成功',auth:'admin',name:req.body.username})
            }
            else{
                return res.json({status:200,message:'登陆成功',auth:'user',name:req.body.username})
            }
        }
        else{
            return res.json({status:500,message:'账号或者密码错误',auth:'null'})
        }
    })
})
//注册
router.post('/register', function(req, res) {
    const sqlStr = 'select * from user '
    conn.query(sqlStr,(err,result)=>{
        const flag = result.some(item => {
            if(item.username === req.body.username ){
                return true
            }
            else{
                return false
            }
        })
        if(flag){
            return res.json({status:200,message:'用户名已重复，请更换一个',code:1})
        }
        else{
            const user = req.body
            const sqlStr = 'insert user set ?'
            conn.query(sqlStr,user,(err,results)=>{
                if(err){
                    return res.json({status:200,message:'注册失败',code:2})
                }
                else{
                    return res.json({status:200,message:'注册成功',code:0})
                }
            })
        }
    })
})

// 获取全部用户信息
router.get('/alluserInfo',(req,res)=>{
    const sqlStr = `select * from user `
    if(JSON.stringify(req.query)!=='{}'){
        const {username} = req.query
        const sql = `select * from user where username='${username}'`
        conn.query(sql,(err,result)=>{
            if(err){
                return res.json({status:500,message:'获取信息失败'})
            }
            else{
                return res.json({status:200,userInfo:result,total:result.length,page:20,pageSize:10})
            }
        })
    }
    else{
        conn.query(sqlStr,(err,result)=>{
            if(err){
                return res.json({status:500,message:'获取信息失败'})
            }
            else{
                return res.json({status:200,userInfo:result,total:result.length,page:20,pageSize:10})
            }
        })
    }
   
})
// 操作黑名单
router.post('/opertionBlack',(req,res)=>{
    const {userId,isBlack} = req.body
    const sqlStr = `update user set isBlack='${isBlack}' where userId ='${userId}' `
    conn.query(sqlStr,(err,results)=>{
        if(err){
            return res.json({status:500,message:'操作失败'})
        }
        else{
            return res.json({status:200,message:'操作成功'})
        }
    })
})
// 举报用户
router.post('/addReport',(req,res)=>{
    const sqlStr = `select * from user where username='${req.body.username}'`
    conn.query(sqlStr,(err,result)=>{
        const obj =result[0]
        obj.times =obj.times+1
        const arr = obj.timespeople.split(',')
        const isHave = arr.some(item=>item===req.body.timespeople)
        if(isHave){
            return res.json({status:200,message:'已举报，无法重复举报'})
        }     
        obj.timespeople = [obj.timespeople,req.body.timespeople]
        const sql = `update user set times='${obj.times}', timespeople='${obj.timespeople}' where username='${req.body.username}'`
        conn.query(sql,(err1,results)=>{
            if(results.affectedRows!==0){
                return res.json({status:200,message:'举报成功'})
            }
        })
    })
})

//获取用户信息
router.get('/userInfo',(req,res)=>{
    const sqlStr = `select * from user where username='${req.query.username}'`
    conn.query(sqlStr,(err,result)=>{
        if(err){
            return res.json({status:200,message:'获取信息失败'})
        }
        else{
            return res.json({userInfo:result})
        }
    })
})
//获取拼车信息
router.get('/carPoolingInfo',function(req,res){
    const sqlStr = 'select * from carpoolinformation '
    if(JSON.stringify(req.query)!=='{}'){
        const {startPoint,endPoint} = req.query
        let searchstartSql
        if(startPoint&&endPoint){
            searchstartSql = `select * from carpoolinformation where startPoint = '${startPoint}' and endPoint='${endPoint}' `
        }
        else{
            searchstartSql = `select * from carpoolinformation where startPoint = '${startPoint}' or endPoint='${endPoint}' `
        }        
        conn.query(searchstartSql,(err,result)=>{
            return res.json({carpoolinformationList:result ,success:true ,total:result.length,page:20,pageSize:10})
        })
    }
    else{
        conn.query(sqlStr,(err,result)=>{
            return res.json({carpoolinformationList:result ,success:true ,total:result.length,page:20,pageSize:10})
        })
    }
    
})

//参与拼车
router.post('/joinCarpool', function(req, res) {
    const {id,name} = req.body
    const getRecordSql = `select * from carpoolinformation where carInfoid = '${id}'`
    conn.query(getRecordSql,(err,result)=>{
        const updateHasPerson = result[0].hasPerson.split(',')
        const updateRestNum = result[0].restNum
        const newPerson = [...updateHasPerson,name]
        const newRestNum = updateRestNum-1
        const updateRecordSql = `update carpoolinformation set hasPerson='${newPerson}' , restNum='${newRestNum}' where carInfoid = '${id}'`
        conn.query(updateRecordSql,(err,results)=>{
            if(results.affectedRows!==0){
                res.json({success:true,message:'拼车成功'})
            }
        })
    })
})
//解除拼车
router.post('/exitCarpool', function(req, res) {
    const {id,name} = req.body
    const getRecordSql = `select * from carpoolinformation where carInfoid = '${id}'`
    conn.query(getRecordSql,(err,result)=>{
        const updateHasPerson = result[0].hasPerson.split(',')
        const updateRestNum = result[0].restNum
        const newPerson = updateHasPerson.filter(item=>item!==name)
        const newRestNum = updateRestNum+1
        const updateRecordSql = `update carpoolinformation set hasPerson='${newPerson}' , restNum='${newRestNum}' where carInfoid = '${id}'`
        conn.query(updateRecordSql,(err,results)=>{
            if(results.affectedRows!==0){
                res.json({success:true,message:'解除拼车成功'})
            }
        })
    })
})
// 创建拼车信息
router.post('/newCarpoolInfo',(req,res)=>{
    const carInfo = req.body
    const sqlStr = 'insert carpoolinformation set ?'
    conn.query(sqlStr,carInfo,(err,results)=>{
        if(err){
            return res.json({status:200,message:'新建失败',code:2})
        }
        else{
            return res.json({status:200,message:'新建成功',code:0})
        }
    })
})


// 获取公告信息
router.get('/notcieInfo',(req,res)=>{
    const Sql = `select * from notice`
    conn.query(Sql,(err,result)=>{
        if(err){
            return res.json({status:500,message:'获取失败'})
        }
        else{
            return res.json({status:200,noticeList:result})
        }
    })
})
// 获取帖子信息
router.get('/forumInfo',(req,res)=>{
    if(Object.keys(req.query).length){
        const sql = `select * from forum where forumuserName='${req.query.forumuserName}'`
        conn.query(sql,(err,result)=>{
            if(err){
                return res.json({status:500,message:'获取失败'})
            }
            else{
                return res.json({status:200,forumList:result})
            }
        })
    }
    else{
        const Sql = `select * from forum`
        conn.query(Sql,(err,result)=>{
            if(err){
                return res.json({status:500,message:'获取失败'})
            }
            else{
                return res.json({status:200,forumList:result})
            }
        })
    }
})

// 修改帖子信息
router.post('/changeForum',(req,res)=>{
    const Sql = `update forum set ? where forumId=?`
    conn.query(Sql,[req.body,req.body.forumId],(err,result)=>{
  
        if(err){
            return res.json({status:500,message:'更新失败'})
        }
        else{
            const sql = `select * from forum `
            conn.query(sql,(errs,results)=>{
                return res.json({status:200,message:'更新成功',forumList:results})
            })
        }
    })
})

// 新建帖子信息
router.post('/newForumInfo',(req,res)=>{
    const forumInfo = req.body
    const sqlStr = 'insert forum set ?'
    conn.query(sqlStr,forumInfo,(err,results)=>{
        if(err){
            return res.json({status:500,message:'新建失败'})
        }
        else{
            return res.json({status:200,message:'新建成功'})
        }
    })
})

//获取评论信息
router.get('/commentInfo',(req,res)=>{
    const Sql = `select * from comment where forumId='${req.query.id}'`
    conn.query(Sql,(err,result)=>{
        if(err){
            return res.json({status:500,message:'获取失败'})
        }
        else{      
            const data = []
            result.forEach(item => {
                data.push(item.commentcontent)
            });     
            return res.json({status:200,commentsList:data})
        }
    })
})
// 添加评论
router.post('/addcommentInfo',(req,res)=>{
    const params ={ ...req.body}
    params.commentcontent = JSON.stringify(params.commentcontent)
    const updateRecordSql = `insert comment set ?`
    const Sql = `select * from forum where forumId='${params.forumId}'`
    conn.query(Sql,(err,result)=>{
        const num = result[0].commentNum+1
        const insertSql = `update forum set commentNum='${num}'`
        conn.query(insertSql,(err,results)=>{
        })
    })
    conn.query(updateRecordSql,params,(err,result)=>{
        if(err){
            return res.json({status:500,message:'添加失败'})
        }
        else{
            return res.json({status:200,message:'添加成功'})
        }
    })
}) 
// 3 把router导出
module.exports = router;