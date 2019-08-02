const mongoose = require('mongoose')
const Schema = mongoose.Schema
const danmuSchema = new Schema({
    doubanId: String,
    author: String,
    time: Number,
    text: String,
    color: String,
    type: Number
})
const Danmus = mongoose.model('Danmus', danmuSchema)
module.exports = Danmus
