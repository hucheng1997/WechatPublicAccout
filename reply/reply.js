const Theaters = require('../model/Theaters');
const Trailers = require('../model/Trailers');
const {url, qiniuImgUrl} = require('../config')
/*
  处理用户发送的消息类型和内容，决定返回不同的内容给用户
 */
module.exports = message => {

    return new Promise(async (resolve, reject) => {

        let options = {
            toUserName: message.FromUserName,
            fromUserName: message.ToUserName,
            createTime: Date.now(),
            msgType: 'text'
        }
        let content = '您在说什么，我听不懂？';

        if (message.MsgType === 'text') {
            //用户发送文字信息
            if (message.Content === '预告片') {
                const data = await Trailers.find({}, {posterKey: 1, _id: 0})
                //将回复内容初始化为空数据
                content = []
                options.msgType = 'news'
                content.push({
                    title: "最新热门电影预告片",
                    description: "点击查看最近热门预告片",
                    picUrl: `${qiniuImgUrl}${data[0].posterKey}`,
                    url: `${url}/trailer`
                })
            } else {
                const text = message.Content;
                const data = await Theaters.findOne({title: text}, {
                    title: 1,
                    summary: 1,
                    doubanId: 1,
                    posterKey: 1,
                    _id: 0
                });
                if (data) {
                    //将回复内容初始化为空数据
                    content = []
                    options.msgType = 'news'
                    content.push({
                        title: data.title,
                        description: data.summary,
                        picUrl: `${qiniuImgUrl}${data.posterKey}`,
                        url: `${url}/detail/${data.doubanId}`
                    })
                }

            }
        } else if (message.MsgType === 'voice') {
            options.msgType = 'voice'
            options.mediaId = message.MediaId
            const text = message.Recognition.toString().replace('。', "")
            console.log(text)
            const data = await Theaters.findOne({title: text}, {
                title: 1,
                summary: 1,
                doubanId: 1,
                image: 1,
                _id: 0
            })
            //将回复内容初始化为空数据
            content = []
            options.msgType = 'news'
            content.push({
                title: data.title,
                description: data.summary,
                picUrl: data.image,
                url: `${url}/detail/${data.doubanId}`
            })
        } else if (message.MsgType === 'event') {
            if (message.Event === 'subscribe') {
                options.msgType = 'text'
                content = '欢迎您关注XXX电影公众号~ \n' +
                    '回复 预告片 查看最新热门电影预告片 \n' +
                    '回复 文本 搜索电影信息 \n' +
                    '回复 语音 搜索电影信息 \n' +
                    '也可以点击下面菜单按钮，来了解XXX电影公众号'
            } else if (message.Event === 'unsubscribe') {
                options.msgType = 'event'
                content = '取关了哈哈'
            } else if (message.Event === 'CLICK') {
                content = '您可以按照以下提示来进行操作~ \n' +
                    '回复 预告片 查看最新热门电影预告片 \n' +
                    '回复 文本 搜索电影信息 \n' +
                    '回复 语音 搜索电影信息 \n' +
                    '也可以点击下面菜单按钮，来了解XXX电影公众号'
            }
        }
        options.content = content
        console.log(content)
        resolve(options)
    })

}
