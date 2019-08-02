const puppeteer = require('puppeteer');

const url = 'https://movie.douban.com/coming'
module.exports = async () => {
    const time1 = Date.now()
    console.log('爬取开始')
    //1、打开浏览器
    const browser = await puppeteer.launch({
        args: ['--no-sandbox'],
        //headless: false    //以无头浏览器的形式打开浏览器，没有界面显示，在后台运行的
    });
    //2、创建tab标签页
    const page = await browser.newPage();
    //3、跳转到指定网址
    await page.goto(url, {
        timeout: 0
    });
    //  await timeout()
    //4、等待网址加载完成，开始爬取数据
    //爬取预告片网址
    let result = await page.evaluate(() => {
        //对加载好的页面进行dom操作
        let result = []
        //获取所有热门电影的li
        const $list = $('.coming_list>tbody>tr')

        //取预告片想看>2000的数据
        for (let i = 0; i < $list.length; i++) {
            const liDom = $list[i]
            //获取想看的人数
            let num = parseInt($(liDom).find('td').last().text())
            if (num > 5000) {
                let href = $(liDom).find('td').eq(1).find('a').attr('href')
                result.push(href)
            }
        }
        return result
    })

    const trailers = []
    for (let i = 0; i < result.length; i++) {

        const href = result[i]

        //跳转到指定网址
        await page.goto(href, {
            timeout: 0
        });
        const itemResult = await page.evaluate(() => {
            //电影封面图片
            const $backgroundCover = $('.related-pic-video').css('background-image')
            let cover;
            if ($backgroundCover) {
                cover = $backgroundCover.split('"')[1].split('?')[0];
            } else {
                cover = ""
            }
            const $video = $('.related-pic-video')
            //预告片地址
            let href;
            if ($video) {
                href = $video.attr('href')
            } else {
                href = ""
            }
            //电影名
            const title = $('[property="v:itemreviewed"]').text()
            //导演
            const directors = $('[rel="v:directedBy"]').text()
            //演员
            let casts = []
            const $actsArr = $('[rel="v:starring"]')
            if ($actsArr.length >= 3) {
                for (let i = 0; i < 3; i++) {
                    casts.push($actsArr[i].innerText)
                }
            } else {
                for (let i = 0; i < $actsArr.length; i++) {
                    casts.push($actsArr[i].innerText)
                }
            }
            //海报图
            const image = $('[rel="v:image"]').attr('src')
            //类型
            let genreArr = [];
            const $genre = $('[property="v:genre"]')
            for (let i = 0; i < $genre.length; i++) {
                genreArr.push($genre[i].innerText)
            }
            //上映时间
            const releaseDate = $('[property="v:initialReleaseDate"]').text()
            //评分
            let rating = $('[property="v:average"]').text()
            if (!rating) {
                rating = ""
            }
            //简介
            const summary = $('[property="v:summary"]').text().replace(/\s+/g, '')
            //片长
            const runtime = $('[property="v:runtime"]').text();
            //豆瓣id
            let doubanId = $('.a_show_login.lnk-sharing').attr('share-id');
            let item = {
                title,
                directors,
                casts,
                genreArr,
                image,
                summary,
                releaseDate,
                doubanId,
                runtime,
                rating,
                href,
                cover
            }
            return item
        })
        trailers.push(itemResult)
    }
    for (let i = 0; i < trailers.length; i++) {
        const href = trailers[i].href
        if (href) {
            //跳转到指定网址
            await page.goto(href, {
                timeout: 0
            });
            //添加预告片电影连接
            trailers[i].link = await page.evaluate(() => {
                //电影链接
                let link = $('video>source').attr('src')
                return link
            })
        } else {
            trailers[i].link = ""
        }

    }
    const time2 = Date.now()
    console.log(trailers)
    console.log("爬取" + trailers.length + "条数据的时间：" + (time2 - time1) / 1000)
    //5、关闭浏览器
    await browser.close();
    return trailers
}

function timeout() {
    return new Promise(resolve => setTimeout(resolve, 4000)
    )
}


