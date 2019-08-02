//引入七牛模块
const qiniu = require('qiniu')
const {accessKey,secretKey}=require('../../config')

//定义一个鉴权对象
var mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
//定义配置对象
var config = new qiniu.conf.Config();
//config.useHttpsDomain = true;
config.zone = qiniu.zone.Zone_z2;
var bucketManager = new qiniu.rs.BucketManager(mac, config);

/*
    resUrl 网络资源地址
    bucket 存储空间的名称
    key是重命名网络资源的名称
 */
const bucket = "xxx_movie";
module.exports = (resUrl, key) => {
    return new Promise((resolve, reject) => {
        bucketManager.fetch(resUrl, bucket, key, function (err, respBody, respInfo) {
            if (err) {
                console.log('文件上传失败：'+err);
            } else {
                if (respInfo.statusCode == 200) {
                    console.log('文件上传成功');
                    resolve()
                }
            }
        });
    })
}
