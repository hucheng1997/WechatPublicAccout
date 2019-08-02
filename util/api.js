/*
    常量
 */
const prefix='https://api.weixin.qq.com/cgi-bin/'
module.exports ={
    access_token:`${prefix}token?grant_type=client_credential`,
    ticket:`${prefix}ticket/getticket?type=jsapi`,
    menu:{
        create:`${prefix}menu/create`,
        delete:`${prefix}menu/delete`
    }
}
