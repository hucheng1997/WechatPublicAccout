//引入Theaters
const Trailers = require('../../model/Trailers')
module.exports = async data => {
    for (let i = 0; i < data.length; i++) {
        let item = data[i]
        const result = await Trailers.create({
            title: item.title,
            rating: item.rating,
            directors: item.directors,
            casts: item.casts,
            genreArr: item.genreArr,
            //海报图
            image: item.image,
            link: item.link,
            summary: item.summary,
            releaseDate: item.releaseDate,
            doubanId: item.doubanId,
            runtime: item.runtime,
            //预告片图
            cover: item.cover,

        })
    }
    console.log('保存数据成功')

}
