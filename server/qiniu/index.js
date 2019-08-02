/*
    将数据库中的图片上传到七牛服务器中
 */
const upload = require('./upload')
const nanoid = require('nanoid')
module.exports = async (key, model) => {
    /*
        1.获取数据库中图片的连接和创建随机字符
        2、上传到七牛汇总
     */
    const data = await model.find({$or: [{[key]: ''}, {[key]: null}, {[key]: {$exists: false}}]})
    for (let i = 0; i < data.length; i++) {
        //获取每个movies
        let trailer = data[i]
        //上传图片到七牛汇总
        let url = trailer.image;
        let filename = ".jpg"
        if (key === 'coverKey') {
            url = trailer.cover
        } else if (key === 'videoKey') {
            url = trailer.link
            filename = '.mp4'
        }
        let filePath = `${nanoid(10)}${filename}`
        console.log(filePath)
        console.log(key)
        await upload(url, filePath)
        console.log('上传成功')
        trailer[key] = filePath
        await trailer.save()
    }
}

