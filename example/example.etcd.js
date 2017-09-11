'use strict';

//const Etcd = require('../index').etcd;
const etcd = require('../index').etcd('http://192.168.1.173:8379');

const logger = require('../index').logger('etcd');

//允许设置全局URL
//Etcd.set_url('http://192.168.1.173:8379');
//const etcd = new Etcd();

const etcd_example = async ()=>{
    try{

        await etcd.set('/test/123', {a: 100, b: 200, c : [{c1: 'c1'}, {c2: 'c2'}]}, 20);
        await etcd.put('/test/1234', '#aaa\n\n123', 20);


        let body = await etcd.get('/');
        logger.debug(body.node.nodes);

        let v = await etcd.mget('/platform/server', true, true);
        logger.debug(v);

        let watcher = etcd.watcher('/test/123');

        const logout = logger.debug.bind(logger);
        watcher.on("change", logout);
        // watcher.on("expire", logout);
        // watcher.on("set", logout);
        // watcher.on("delete", logout);
        // watcher.on("error", logout);

    }catch(err){
        logger.error(err);
    }

};

etcd_example();