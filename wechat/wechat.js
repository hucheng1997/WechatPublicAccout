//引入config模块
const {appID, appsecret} = require('../config/index.js')
const menu = require('./menu')
const api = require('../util/api')
const {resolve, join} = require('path')
const {writeFileAsync, readFileAsync} = require('../util/tool')
const rp = require("request-promise-native")
const request = require('request');
const {readFile, writeFile, createReadStream, createWriteStream} = require('fs')

class Wechat {
    constructor() {
    }

    /*
     用来获取access_token
     */
    getAccessToken() {
        const url = `${api.access_token}&appid=${appID}&secret=${appsecret}`
        return new Promise((resolve, reject) => {
            rp({method: "GET", url, json: true}).then(res => {
                /*
                access_token: '23_E3GhXnvYKh6xxdPq0e5ECFgXI4DeU2FNNGbQUKRX1O-4a0KrVJGduEwnBgul730-9qEkxqvnE2KE9YPxUrNVIzvcnlBfTqapB2HQGw840fjoGXs3L7UN08GrqQDOGV2UlX3P01lqKo0uLtcuTGWiAHAFSI',
                expires_in: 7200
                 */
                res.expires_in = Date.now() + (res.expires_in - 300) * 1000
                resolve(res)
            }).catch(error => {
                reject("30:" + 'getAccessToken()方法出错：' + error)
            })
        })

    }

    /*
    保存access_token
     */
    saveAccessToken(access_token) {
        return writeFileAsync(access_token, 'accessToken.txt')
    }

    /*
    读取access_token
     */
    readAccessToken() {
        return readFileAsync('accessToken.txt')

    }

    /*
    用来检测access_token是否有效
     */
    isValidAccessToken(data) {
        if (!data || !data.access_token || !data.expires_in) {
            //代表access_token无效
            return false
        }
        if (data.expires_in < Date.now()) {
            //代表access过期
            return false
        }
        return true
    }

    /*
    获取没有过期的access_token
     */
    fetchAccessToken() {

        //优化
        if (this.access_token && this.expires_in && this.isValidAccessToken(this)) {

            //说明之前保存过access_token，并且它是有效的, 直接使用
            return Promise.resolve({
                access_token: this.access_token,
                expires_in: this.expires_in
            })
        }
        return new Promise((resolve, reject) => {
            this.readAccessToken()
                .then(async res => {
                    //本地有文件,需要判断是否过期
                    if (this.isValidAccessToken(res)) {
                        //有效的
                        //  resolve(res)
                        return Promise.resolve(res)
                    } else {
                        const res = await this.getAccessToken()
                        await this.saveAccessToken(res)
                        //返回access_token
                        // resolve(res)
                        return Promise.resolve(res)
                    }
                })
                .catch(async err => {
                    const res = await
                        this.getAccessToken()
                    await this.saveAccessToken(res)
                    //返回access_token
                    //resolve(res)
                    return Promise.resolve(res)
                })
                .then(res => {
                    //将access_token挂载到this上
                    this.access_token = res.access_token;
                    this.expires_in = res.expires_in;

                    //返回res包装了一层promise对象（此对象为成功的状态）
                    //是this.readAccessToken()最终的返回值
                    resolve(res);
                })
        })
    }

    /*
     用来获取jsapi_ticket
     */
    getJsapiTicket() {
        return new Promise(async (resolve, reject) => {
            const data = await this.fetchAccessToken()
            const url = `${api.ticket}&access_token=${data.access_token}`
            rp({method: "GET", url, json: true}).then(res => {
                /*
                    "errcode":0,
                    "errmsg":"ok",
                    "ticket":"bxLdikRXVbTPdHSM05e5u5sUoXNKd8-41ZO3MhKoyN5OfkWITDGgnr2fwJ0m9E8NYzWKVZvdVtaUgWvsdshFKA",
                    "expires_in":7200
                 */
                resolve({
                    ticket: res.ticket,
                    expires_in: Date.now() + (res.expires_in - 300) * 1000
                })
            }).catch(err => {
                reject("30:" + 'getJsapiTicket()方法出错：' + err)
            })
        })
    }

    /*
    保存jsapi_ticket
     */
    saveJsapiTicket(ticket) {
        return writeFileAsync(ticket, 'ticket.txt')
    }

    /*
    读取jsapi_ticket
     */
    readJsapiTicket() {
        return readFileAsync('ticket.txt')

    }

    /*
    用来检测jsapi_ticket是否有效
     */
    isValidJsapiTicket(data) {
        if (!data || !data.access_token || !data.expires_in) {
            //代表access_token无效
            return false
        }
        if (data.expires_in < Date.now()) {
            //代表access过期
            return false
        }
        return true
    }

    /*
    获取没有过期的jsapi_ticket
     */
    fetchJsapiTicket() {

        //优化
        if (this.ticket && this.ticket_expires_in && this.isValidJsapiTicket(this)) {
            //说明之前保存过access_token，并且它是有效的, 直接使用
            return Promise.resolve({
                ticket: this.ticket,
                expires_in: this.ticket_expires_in
            })
        }
        return new Promise((resolve, reject) => {
            this.readJsapiTicket()
                .then(async res => {
                    //本地有文件,需要判断是否过期
                    if (this.isValidJsapiTicket(res)) {
                        return Promise.resolve(res)
                    } else {
                        const res = await
                            this.getJsapiTicket()
                        await this.saveJsapiTicket(res)
                        //返回access_token
                        // resolve(res)
                        return Promise.resolve(res)
                    }
                })
                .catch(async err => {
                    const res = await this.getJsapiTicket()

                    await this.saveJsapiTicket(res)
                    return Promise.resolve(res)
                })
                .then(res => {
                    this.ticket = res.ticket
                    this.ticket_expires_in = res.expires_in
                    resolve(res)
                })
        })
    }

    /*
      创建菜单栏
     */
    createMenu() {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await this.fetchAccessToken();
                const url = `${api.menu.create}?access_token=${data.access_token}`
                const result = await rp({method: 'POST', url, json: true, body: menu})
                resolve(result)
            } catch (e) {
                reject("createMenu方法出错：" + e)
            }
        })
    }

    /*
    删除菜单栏
     */
    deleteMenu() {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await this.fetchAccessToken();
                const url = `${api.menu.delete}?access_token=${data.access_token}`
                const result = rp({method: 'GET', url, json: true})
                resolve(result)
            } catch (e) {
                reject("deleteMenu方法出错：" + e)
            }

        })

    }

    /*
    上传临时素材
     */
    uploadTemporaryMeterial(type, fileName) {
        //获取文件的绝对路径
        const filePath = resolve(__dirname, '../media', fileName)
        return new Promise(async (resolve1, reject) => {
            try {
                //获取access_token
                const data = await this.fetchAccessToken()
                //定义请求的地址
                const url = `${api.temporary.upload}access_token=${data.access_token}&type=${type}`

                const formData = {
                    media: createReadStream(fileName)
                }
                //以form表单的方式发送请求
                const result = rp({method: 'POST', url, json: true, formData})
                //将数据返回给用户
                resolve(result)
            } catch (e) {
                reject('uploadTemporaryMaterial方法出了问题：' + e);
            }

        })
    }

    /*
    获取临时素材
     */
    getTemporaryMeterial(type, mediaId, fileName) {
        //获取文件的绝对路径
        const filePath = resolve(__dirname, '../media', fileName);
        return new Promise(async (resolve1, reject) => {
            //获取access_token
            const data = await this.fetchAccessToken()
            //定义请求地址
            let url = `${api.temporary.get}access_token=${data.access_token}&media_id=${mediaId}`
            if (type === 'video') {
                //视频文件只支持http协议
                url = url.replace('https://', 'http://');
                //发送请求
                const data = await rp({method: 'GET', url, json: true});
                //返回出去
                resolve(data);
            } else {
                //其他类型文件
                request(url)
                    .pipe(createWriteStream(filePath))
                    .once('close', resolve)   //当文件读取完毕时，可读流会自动关闭，一旦关闭触发close事件，从而调用resolve方法通知外部文件读取完毕了
            }
        })
    }

    //上传永久素材
    uploadPermanentMaterial (type, material, body) {

        return new Promise(async (resolve, reject) => {
            try {
                //获取access_token
                const data = await this.fetchAccessToken();
                //请求的配置对象
                let options = {
                    method: 'POST',
                    json: true
                }

                if (type === 'news') {
                    //上传图文消息
                    options.url = `${api.permanment.uploadNews}access_token=${data.access_token}`;
                    options.body = material;
                } else if (type === 'pic') {
                    //上传图文消息中的图片
                    options.url = `${api.permanment.uploadImg}access_token=${data.access_token}`;
                    options.formData = {
                        media: createReadStream(join(__dirname, '../media', material))
                    }
                } else {
                    //其他媒体素材的上传
                    options.url = `${api.permanment.uploadOthers}access_token=${data.access_token}&type=${type}`;
                    options.formData = {
                        media: createReadStream(join(__dirname, '../media', material))
                    }
                    //视频素材，需要多提交一个表单
                    if (type === 'video') {
                        options.body = body;
                    }
                }

                //发送请求
                const result = await rp(options);
                //将返回值返回出去
                resolve(result);
            } catch (e) {
                reject('uploadPermanentMaterial方法出了问题：' + e);
            }

        })
    }
    //获取永久素材
    getPermanentMaterial (type, mediaId, fileName) {

        return new Promise(async (resolve, reject) => {
            try {
                //获取access_token
                const data = await this.fetchAccessToken();
                //定义请求地址
                const url = `${api.permanment.get}access_token=${data.access_token}`;

                const options = {method: 'POST', url, json: true, body: {media_id: mediaId}};
                //发送请求
                if (type === 'news' || 'video') {
                    const data = await rp(options);
                    resolve(data);
                } else {
                    request(options)
                        .pipe(createWriteStream(join(__dirname, '../media', fileName)))
                        .once('close', resolve)
                }
            } catch (e) {
                reject('getPermanentMaterial方法出了问题：' + e);
            }

        })

    }

    //上传素材
    uploadMaterial (type, material, body, isPermanent = true) {

        return new Promise(async (resolve, reject) => {
            try {
                //获取access_token
                const data = await this.fetchAccessToken();
                //请求的配置对象
                let options = {
                    method: 'POST',
                    json: true,
                    formData: {
                        media: createReadStream(join(__dirname, '../media', material))
                    }
                }

                if (isPermanent) {
                    //永久素材逻辑
                    if (type === 'news') {
                        //上传图文消息
                        options.url = `${api.permanment.uploadNews}access_token=${data.access_token}`;
                        options.body = material;
                        options.formData = null;
                    } else if (type === 'pic') {
                        //上传图文消息中的图片
                        options.url = `${api.permanment.uploadImg}access_token=${data.access_token}`;
                    } else {
                        //其他媒体素材的上传
                        options.url = `${api.permanment.uploadOthers}access_token=${data.access_token}&type=${type}`;
                        //视频素材，需要多提交一个表单
                        if (type === 'video') {
                            options.body = body;
                        }
                    }
                } else {
                    //临时素材逻辑
                    options.url = `${api.temporary.upload}access_token=${data.access_token}&type=${type}`;
                }

                //发送请求
                const result = await rp(options);
                //将返回值返回出去
                resolve(result);
            } catch (e) {
                reject('uploadPermanentMaterial方法出了问题：' + e);
            }
        })
    }

}


(async () => {


    // const w = new Wechat()
    // const accessToken = await w.fetchAccessToken();
    // console.log(accessToken)
    // let result = await w.deleteMenu()
    // console.log(result)
    // result = await w.createMenu()
    // console.log(result)
})()

module.exports = Wechat


