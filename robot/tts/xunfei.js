'use strict';
// 讯飞语音合成

const axios = require('axios');
const CryptoJS = require("crypto-js");


module.exports = class IFlyTek{
    constructor(vid='20068') {
        this.password = 'G%.g7"Y&Nf^40Ee<';
        this.key = CryptoJS.enc.Utf8.parse(password);
        this.vid = vid;
    }

    md5(text) {
        return CryptoJS.MD5(text).toString();
    }

    encode(text) {
        let encryptedData = CryptoJS.AES.encrypt(`{"channel": "10000001","synth_text_hash_code":"${this.md5(text)}"}`, this.key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        let hexData = encryptedData.ciphertext.toString();
        let encryptedHexStr = CryptoJS.enc.Hex.parse(hexData);
        return CryptoJS.enc.Base64.stringify(encryptedHexStr);
    }

    decode(encryptedBase64Str) {
        let decryptedData = CryptoJS.AES.decrypt(encryptedBase64Str, this.key, {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        let text = decryptedData.toString(CryptoJS.enc.Utf8);
        return JSON.parse(text);
    }

    async tts(text) {
        const res = await axios({
            url: 'http://www.peiyinge.com/web-server/1.0/works_synth_sign',
            method: 'post',
            data: {
                req: encode(text)
            }
        })
        if(res.data.status === 0) {
            try{
                const { time_stamp, sign_text } = decode(res.data.body);
                const url = `http://proxyweb.peiyinge.com/synth?uid=&ts=${time_stamp}&sign=${sign_text}&vid=${this.vid}&f=v2&cc=0000&sid=C71557F091BF0461BB734A85D3FCE71B&volume=6&speed=0&content=${encodeURIComponent(text)}&listen=0`;
                return url;
            }catch(e) {
                throw new Error(e.message)
            }
        }else{
            throw new Error(res.data.message || '语音合成出错了')
        }
    }
}

// const tts = new IFlyTek();
// tts.tts('现在几点了？').then(res => {console.log(res)})