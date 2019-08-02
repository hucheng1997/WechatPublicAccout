const puppeteer = require('puppeteer');

const url = 'https://movie.douban.com/cinema/nowplaying/beijing/'
module.exports = async () => {
    const time1=Date.now()
    console.log('爬取开始')
    //1、打开浏览器
    const browser = await puppeteer.launch({
       args: ['--no-sandbox'],
       //headless: false    //以无头浏览器的形式打开浏览器，没有界面显示，在后台运行的
    });
    //2、创建tab标签页
    const page = await browser.newPage();
    //3、跳转到指定网址
    await page.goto(url,{
        timeout:0
    });
  //  await timeout()
    //4、等待网址加载完成，开始爬取数据
    let result = await page.evaluate(() => {
        //对加载好的页面进行dom操作
        let result = []
        //获取所有热门电影的li
        const $list = $('#nowplaying>.mod-bd>.lists>.list-item')

        //取8条数据
        for (let i = 0; i < 8; i++) {
            const liDom = $list[i]
            //电影标题
            let title = $(liDom).data('title');
            //电影评分
            let rating = $(liDom).data('score');
            //电影片长
            let runtime = $(liDom).data('duration');
            //导演
            let directors = $(liDom).data('director');
            //主演
            let casts = $(liDom).data('actors');
            //豆瓣id
            let doubanId = $(liDom).data('subject');
            //电影的详情页网址
            let href = $(liDom).find('.poster>a').attr('href')
            let image = $(liDom).find('.poster>a>img').attr('src')
            result.push({
                title, rating, runtime, directors, casts, doubanId, href, image
            })
        }
        return result
    })
    for (let i=0;i<result.length;i++){
        let item=result[i]
        const href=item.href
        //跳转到指定网址
        await page.goto(href,{
            timeout:0
        });
        //await timeout()
        const itemResult=await page.evaluate(()=>{
            let genreArr=[]
            const $genres=$('[property="v:genre"]')
            for (let i=0;i<$genres.length;i++){
                genreArr.push($genres[i].innerText)
            }
            let summary=$('[property="v:summary"]').text().replace(/\s+/g, '')
            const releaseDate = $('[property="v:initialReleaseDate"]')[0].innerText;
            return {genreArr,summary,releaseDate}
        })
        item.genreArr=itemResult.genreArr
        item.summary=itemResult.summary
        item.releaseDate = itemResult.releaseDate;
    }
    console.log(result)
    const time2=Date.now()
    console.log("爬取8条数据的时间："+(time2-time1)/1000)
    //5、关闭浏览器
    await browser.close();
    return result

}
function timeout() {
    return new Promise(resolve=> setTimeout(resolve,4000)
    )
}


