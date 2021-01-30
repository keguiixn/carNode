var express = require('express')
var app = express()
// var mysql = require('mysql')
var bodyParser = require('body-parser')
var router = require('./route');

// router(app);
// 把路由容器挂载到app服务中
// 挂载路由


app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
 app.use(bodyParser.json())

app.use(router);

app.listen(3000,()=>{
    console.log('running...');
})