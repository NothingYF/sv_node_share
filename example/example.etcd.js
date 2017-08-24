'use strict';

const etcd = require('../index').etcd;
const logger = require('../index').logger('etcd');

const etcd_example = async ()=>{
    etcd.set_url('http://192.168.1.173:8379/v2/keys');

    let body = await etcd.get('/');
    logger.debug(body.node.nodes);

};

etcd_example();