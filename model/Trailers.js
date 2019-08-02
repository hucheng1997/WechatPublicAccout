//引入mongoose
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const trailersSchema = new Schema({
    title: String,
    rating: Number,
    directors: String,
    casts: [String],
    genreArr: [String],
    //海报图
    image: String,
    link: String,
    summary: String,
    releaseDate: String,
    doubanId: {
        type: Number,
        unique: true
    },
    runtime: String,
    //预告片图
    cover: String,
    posterKey: String,     //海报图片上传到七牛中，返回的key值
    coverKey: String,      //视频的封面图
    videoKey: String,      //视频
    createTime: {
        type: Date,
        default: Date.now()
    }
})
const Trailers = mongoose.model('Trailers', trailersSchema)
module.exports = Trailers

