/**
 * Created by Nothing on 2017/3/4.
 * HTTP/HTTPS请求
 */

const request = require('request');
const tools = require('./tools');
const logger = require('./logger');

/**
 * HTTP请求
 * @param url
 * @returns {Promise}
 */
const call = function (url) {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (!error) {
                if (response.headers['content-encoding'] && response.headers['content-encoding'] == 'gzip') {
                    zlib.unzip(body, function (err, buffer) {
                        if (err) {
                            reject(err);
                        }
                        body = buffer.toString();
                        resolve({code: response.statusCode, message: body});
                    });
                } else {
                    resolve({code: response.statusCode, message: body});
                }
            } else {
                reject(error);
            }
        })
    });
};

exports.call = call;

const jsoncall = async function (url, body, headers = null) {

    try{
        var o = {
            method : 'POST',
            url : url,
            headers : headers == null ? {'Content-Type': 'application/json;charset=utf-8'} : headers,
            body: tools.isJSON(body) ? JSON.stringify(body, null, 2) : body
        };

        var result = await call(o);
        if(result)
            return result.body;

        logger.error('request no result, url:', url);

    }catch(err){
        logger.error(err);
    }

    return null;
};

exports.jsoncall = jsoncall;

/**
 * 获取base64数据
 * @param url
 * @returns {Promise}
 */
const getBase64 = function (url) {
    return new Promise(function (resolve, reject) {

        var resp = null;
        var bodystream = streamConcat( function(body){
            resolve(body.toString());
        });

        request.get(url)
            .on('error', function(err) {
                reject(err);
            })
            .on('response', function(response) {
                resp = response;
            })
            .pipe(streamBase64.encode()).pipe(bodystream);
    });
};

exports.getBase64 = getBase64;
