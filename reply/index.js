const sha1 = require("sha1")
const config = require("../config")
const template = require('./template')
const reply = require('./reply')
const {getUserDataAsync, parseXMLAsync, formatMessage} = require("../util/tool")
module.exports = () => {
    return async (req, res, next) => {
        const {signature, echostr, timestamp, nonce} = req.query
        const {token} = config
        const sha1Str = sha1([timestamp, nonce, token].sort().join(""))

        if (req.method === 'GET') {
            if (sha1Str === signature) {
                //请求来自微信服务器且验证签名成功
                res.send(echostr)
            } else {
                //验证失败
                res.end("error")
            }
        } else if (req.method === 'POST') {

            if (sha1Str != signature) {
                //验证失败
                res.end("error")
            }
            /*
                <xml><ToUserName><![CDATA[gh_0738a2f7c5fa]]></ToUserName>
                <FromUserName><![CDATA[oX4t4w7gtu3duGNczgWFpeaFq1-U]]></FromUserName>//用户的openid
                <CreateTime>1564070264</CreateTime>/发送的的时间戳
                <MsgType><![CDATA[text]]></MsgType>//发送的消息类型
                <Content><![CDATA[2]]></Content>//发送的内容
                <MsgId>22392100756383478</MsgId>//消息id 微信服务器会默认保存3天用户发送的数据，通过id可以找到消息数据
            </xml>
             */
            const xmlData = await getUserDataAsync(req)
            //将xml解析为js
            const jsData = await parseXMLAsync(xmlData)
            /*
            data:{
              ToUserName: 'gh_0738a2f7c5fa',
              FromUserName: 'oX4t4w7gtu3duGNczgWFpeaFq1-U',
              CreateTime: '1564072829',
              MsgType: 'text',
              Content: '2',
              MsgId: '22392141174168899'
            }
             */
            const message = await formatMessage(jsData)
            const options = await reply(message)
            let replyMessage = template(options)
            res.send(replyMessage)

        } else {
            res.end("error")
        }


    }
}
