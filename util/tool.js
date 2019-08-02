const {parseString} = require("xml2js")
const {readFile, writeFile} = require('fs')
const {resolve}=require('path')
/*
工具函数包
 */
module.exports = {

    /*
    获取用户发送的消息
     */
    getUserDataAsync(req) {
        return new Promise((resolve, reject) => {
            let xmlData = "";

            req
                .on('data', data => {
                    //当流式数据传递过来的时候，会触发当前事件，会将数据注入到回调函数汇总
                    //data为buffer类型
                    data = data.toString()
                    xmlData += data;
                })
                .on('end', () => {
                    //当数据接收完毕时，会触发当前函数
                    resolve(xmlData)
                })
        })

    },
    /*
    将xml转换为js
     */
    parseXMLAsync(xmlData) {
        return new Promise((resolve, reject) => {
            parseString(xmlData, {trim: true}, (err, data) => {
                if (!err) {
                    resolve(data)
                } else {
                    reject("parseXMLAsync有误：" + err)
                }
            })
        })
    },
    /*
    将消息对象格式化
     */
    /*
        {
          xml: {
            ToUserName: [ 'gh_0738a2f7c5fa' ],
            FromUserName: [ 'oX4t4w7gtu3duGNczgWFpeaFq1-U' ],
            CreateTime: [ '1564071410' ],
            MsgType: [ 'text' ],
            Content: [ '2' ],
            MsgId: [ '22392117110589347' ]
          }
        }
     */
    formatMessage(jsData) {
        return new Promise((resolve, reject) => {
            let message = {}
            jsData = jsData.xml
            if (typeof jsData === 'object') {
                //遍历对象
                for (let key in jsData) {
                    let value = jsData[key]
                    //过滤掉空的数据
                    if (Array.isArray(value) && value.length > 0) {
                        message[key] = value[0]
                    }
                }
            }
            resolve(message)
        })
    },

    writeFileAsync(data, fileName) {
        data = JSON.stringify(data)
        const filePath=resolve(__dirname,fileName)
        return new Promise((resolve, reject) => {
            writeFile(filePath, data, err => {
                if (!err) {
                    resolve()
                } else {
                    reject()
                }
            })
        })
    },
    readFileAsync(fileName) {
        const filePath=resolve(__dirname,fileName)
        return new Promise((resolve, reject) => {
            readFile(filePath, (err, data) => {
                if (!err) {
                    data = JSON.parse(data)
                    resolve(data)
                } else {
                    reject('读取文件失败！' + err)
                }
            })
        })
    }

}
