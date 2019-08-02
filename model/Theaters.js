const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const theatersSchema = new Schema({
        title: String,
        rating: Number,
        runtime: String,
        directors: String,
        casts: String,
        doubanId: {
            type: Number,
            unique: true
        },
        image: String,
        genreArr: [String],
        summary: String,
        releaseDate: String,
        posterKey: String,//图片上传到七牛中，返回的key值
        createTime: {
            type: Date,
            default: Date.now()
        }

    })
const Theaters = mongoose.model('Theaters', theatersSchema)
module.exports = Theaters
