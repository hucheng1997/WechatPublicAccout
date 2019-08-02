const express = require("express")
const sha1 = require('sha1')
//引入body-parser
const reply = require("../reply")
const Wechat = require('../wechat/wechat')
const {url, qiniuImgUrl} = require('../config')
const Theaters = require('../model/Theaters')
const Trailers = require('../model/Trailers')
const Danmus = require('../model/Danmus')
//获取路由
const Router = express.Router
const router = new Router()
const wechatApi = new Wechat()

//搜索页面路由
router.get('/search', async (req, res) => {

    /*
        生成js-sdk使用的签名：
            1、需要的参数jsapi_ticket(临时票据)、noncestr(随机字符串),timestamp（时间戳）、url(当前服务器的地址)
            2、将其进行字典序排序，以'&'拼接在一起
            3、进行sha1加密
     */
    //获取随机字符串
    const noncestr = Math.random().toString().split('.')[1]
    //获取时间戳
    const timestamp = Date.now()
    const {ticket} = await wechatApi.fetchJsapiTicket();
    const arr = [
        `jsapi_ticket=${ticket}`,
        `noncestr=${noncestr}`,
        `timestamp=${timestamp}`,
        `url=${url}/search`
    ]
    const str = arr.sort().join('&');
    const signature = sha1(str);
    res.render('search', {
        signature, noncestr, timestamp
    })
})

//详情页面路由
router.get('/detail/:id', async (req, res) => {
    //获取占位符id的值
    const {id} = req.params
    if (id) {
        //去数据库中找到id值对应的数据
        const data = await Theaters.findOne({doubanId: id}, {_id: 0, __v: 0, createTime: 0, doubanId: 0})
        data.posterKey = `${qiniuImgUrl}${data.posterKey}`
        //渲染到页面
        res.render('detail', {data})
    } else {
        res.send('error')
    }
})

//预告片页面路由
router.get('/trailer', async (req, res) => {
    const trailers = await Trailers.find({}, {_id: 0, image: 0, cover: 0, link: 0, __v: 0})
    res.render('trailer', {trailers, qiniuImgUrl, url})
})

//加载弹幕的路由
router.get('/v3', async (req, res) => {
    const {id} = req.query
    const data = await Danmus.find({doubanId: id}, {_id: 0, image: 0, cover: 0, link: 0, __v: 0})
    let resData = []
    data.forEach(function (item) {
        resData.push([item.time, item.type, item.color, item.author, item.text])
    })
    //返回相应
    res.send({code: 0, data: resData})
})
router.get('/search/byName', async (req, res) => {
    const {reqData} = req.query
    const text=reqData.toString().replace('。', "")
    const data = await Theaters.find({title: /text/}, {_id: 0, image: 0, cover: 0, link: 0, __v: 0})

    let resData = []
    data.forEach(function (item) {
        resData.push([item.time, item.type, item.color, item.author, item.text])
    })
    // //返回相应
    res.send({code: 0, data:resData})
})
router.post('/v3', async (req, res) => {
    /*
    弹幕信息是以流式数据发送过来的
    接受的数据是一个buffer，需要调用toString转换成字符串
   */
    //获取请求参数
    const {id, author, time, text, color, type} = await new Promise(resolve => {
        let body = '';
        req
            .on('data', data => {
                console.log(data)
                body += data.toString();
                console.log('body', body)
            })
            .on('end', () => {
                //将json字符串转化成js对象
                resolve(JSON.parse(body)); // {"id":"demo","author":"DIYgod","time":0,"text":"的撒打算","color":16777215,"type":0}
            })
    })
    //保存到数据库中
    await Danmus.create({
        doubanId: id,
        author,
        time,
        text,
        color,
        type
    })

    //返回响应
    res.send({code: 0, data: {}});
})

//验证服务器的有效性,接收所有处理的消息
router.use(reply())

module.exports = router
