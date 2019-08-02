//这里必须加逗号！！！！！
const db = require('../db');
const theatersCrawler = require('./crawler/theatersCrawler');
const saveThreaters = require('./save/saveThreaters');
const saveTrailers = require('./save/saveTrailers');
const uploadQiniu = require('./qiniu/index');
const trailersCrawler = require('./crawler/trailersCrawler');
const Theaters = require('../model/Theaters');
const Trailers = require('../model/Trailers');
(async () => {
    // //爬取数据
    // const data = await theatersCrawler();
    // // //将爬取的数据保存到数据库中
    // await saveThreaters(data)
    //保存豆瓣的图片到七牛服务器
    // await uploadQiniu('posterKey',Theaters);
    //爬取預告片信息
    // const data=await trailersCrawler()
    //保存預告片信息
    // await saveTrailers(data)
    //将预告的image、cover、link上传到七牛
    // await uploadQiniu('posterKey', Trailers)
    //await uploadQiniu('coverKey', Trailers)
    await uploadQiniu('videoKey', Trailers)
    console.log("finish")
})()
