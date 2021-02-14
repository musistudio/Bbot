const crypto = require('crypto');

// 常用工具函数
module.exports =  {
    md5: text => crypto.createHash('md5').update(text).digest('hex'),
}