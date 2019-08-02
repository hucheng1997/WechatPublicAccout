//引入Theaters
const Theaters = require('../../model/Theaters')
// {
//     title: '烈火英雄',
//     directors: '陈国辉',
//     casts: [ '黄晓明', '杜江', '谭卓' ],
//     genreArr: [ '剧情', '灾难' ],
//     image: 'https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2563630521.webp',
//     summary: '滨海市海港码头发生管道爆炸，整个罐区的原油都顺着A01油罐往外流，化成火海和阵阵爆炸，威胁全市、全省，甚至邻国的安全。慌乱的市民们四处奔逃，一辆辆消防车却逆向冲进火海……',
//     releaseDate: '2019-08-01(中国大陆)',
//     doubanId: '30221757',
//     runtime: '120分钟',
//     rating: '',
//     href: 'https://movie.douban.com/trailer/250686/#content',
//     cover: 'https://img1.doubanio.com/img/trailer/medium/2564316917.jpg',
//     link: 'http://vt1.doubanio.com/201907310403/f5670f7e8b12d2e7a335f4ae7b21f4cc/view/movie/M/402500686.mp4'
// }
module.exports =async data => {
    for (let i =0;i<data.length;i++){
        let item=data[i]
        const result=await Theaters.create({
            title: item.title,
            rating: item.rating,
            runtime: item.runtime,
            directors:item.directors,
            casts: item.casts,
            doubanId: item.doubanId,
            image: item.image,
            genreArr: item.genreArr,
            summary: item.summary,
            releaseDate: item.releaseDate
        })
    }
    console.log('保存数据成功')

}
