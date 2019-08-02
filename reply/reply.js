const Theaters = require('../model/Theaters');
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
            if (message.Content === '热门') {
                const data = await Theaters.find({}, {title: 1, summary: 1, doubanId: 1, posterKey: 1, _id: 0})
                //将回复内容初始化为空数据
                content = []
                options.msgType = 'news'
                for (let i = 0; i < data.length; i++) {
                    content.push({
                        title: data[i].title,
                        description: data[i].summary,
                        picUrl: `${qiniuImgUrl}${data[i].posterKey}`,
                        url: `${url}/detail/${data[i].doubanId}`
                    })
                }
            } else if (message.Content === '首页') {
                const data = await Theaters.find({}, {title: 1, summary: 1, doubanId: 1, posterKey: 1, _id: 0})
                //将回复内容初始化为空数据
                content = []
                options.msgType = 'news'
                for (let i = 0; i < data.length; i++) {
                    content.push({
                        title: data[i].title,
                        description: data[i].summary,
                        picUrl: `${qiniuImgUrl}${data[i].posterKey}`,
                        url: `${url}/detail/${data[i].doubanId}`
                    })
                }
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
                options.msgType = 'event'
                content = '欢迎您关注XXX电影公众号~ \n' +
                    '回复 首页 查看XXX电影预告片 \n' +
                    '回复 热门 查看最热门的电影 \n' +
                    '回复 文本 搜索电影信息 \n' +
                    '回复 语音 搜索电影信息 \n' +
                    '也可以点击下面菜单按钮，来了解XXX电影公众号';
                if (message.EventKey) {
                    options.msgType = 'event'
                    content = '扫描带参数的二维码关注公众号'
                }
            } else if (message.Event === 'unsubscribe') {
                options.msgType = 'event'
                content = '取关了哈哈'
            } else if (message.Event === 'CLICK') {
                content = '您可以按照以下提示来进行操作~ \n' +
                    '回复 首页 查看XXX电影预告片 \n' +
                    '回复 热门 查看最热门的电影 \n' +
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
