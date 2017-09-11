'use strict';

//const Etcd = require('../index').etcd;
const etcd = require('../index').etcd('http://192.168.1.173:8379');

const logger = require('../index').logger('etcd');

//允许设置全局URL
//Etcd.set_url('http://192.168.1.173:8379');
//const etcd = new Etcd();

const etcd_example = async ()=>{
    try{

        await etcd.set('/test/123', {a: 100, b: 200, c : [{c1: 'c1'}, {c2: 'c2'}]}, 5);
        await etcd.put('/test/1234', '#aaa\n\n123', 20);


        let body = await etcd.get('/');
        logger.debug(body.node.nodes);

        let v = await etcd.mget('/platform/server', true, true);
        logger.debug(v);

        etcd.watch('/test/123', (err, result)=>{
            if(err){
                logger.error('watch error', err);
            }else{
                logger.debug('watch ok', result);
            }
        });

    }catch(err){
        logger.error(err);
    }

};

etcd_example();