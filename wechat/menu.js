const {url}=require('../config')
module.exports = {
    "button": [
        {
            "type":"view",
            "name":"预告片🎬",
            "url":`${url}/trailer`
        },
        {
            "type":"view",
            "name":"语音识别🎤",
            "url":`${url}/search`
        },
        {
            "name": "戳我💋",
            "sub_button": [
                {
                    "type": "view",
                    "name": "官网☀",
                    "url": `https://www.baidu.com`
                },
                {
                    "type": "click",
                    "name": "帮助🙏",
                    "key": "help"
                }
            ]
        }]
}
