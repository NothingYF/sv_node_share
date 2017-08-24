const request = require('../index').request;
const logger = require('../index').logger('request');

const example = async()=>{
    let html = await request.call('http://www.baidu.com');
    logger.debug('baidu: ', html.body);

    let v = await request.call('http://127.0.0.1:2379/v2/keys/testjson');
    logger.debug(v.body.node.value);

    v = await request.call({
        url : 'https://127.0.0.1:8989',
        rejectUnauthorized : false
    });


    var o = {
        method : 'PUT',
        url : 'http://127.0.0.1:2379/v2/keys/testjson',
        headers : {'Content-Type': 'application/x-www-form-urlencoded'},
        body: JSON.stringify({'test': 1})
    };

    let ret = await request.call(o);
    logger.debug(ret);
};


example();
