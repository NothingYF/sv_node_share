# sv_node_share
sv node share  

[![build status](https://git.scsv.online/node-public/sv_node_share/badges/master/build.svg)](https://git.scsv.online/node-public/sv_node_share/pipelines)

## 安装

需要node v7.6.0以上版本支持

```javascript

npm set registry http://npm.scsv.online
npm install sv_node_share --save
```

## Usage

### Cache

```javascript

const cache = require('sv_node_share').cache;


//初始化缓存,需在程序初始化时调用
cache.init('127.0.0.1', 6379, 0);

//设置缓存
cache.set('123', {id: '123'}, 60)

//获取缓存
cache.get('123');

//设置缓存失效时间
cache.expire('123', 60);

//删除缓存
cache.del('123')

//获取所有匹配键值
cache.keys('123*')

```

### logger

```javascript

const logger = require('sv_node_share').logger('test:server')

logger.info('hello');
logger.warn('hello');
logger.error('hello');

```

### request


```javascript

const request = require('sv_node_share').request;

await request.call('http://www.baidu.com');

await request.jsoncall('http://locahost:9000/jsontest', { id: '123' });

await request.getBase64(image_url);
```

### tools


```javascript

const request = require('sv_node_share').tools;

tools.isJSON({id: '123'});
await tools.sleep(1000);
await tools.exec('netstat -an');
tools.sysinfo();

```

### validate


```javascript

const validate = require('sv_node_share').validate;

validate.isMobile('13600000000');
validate.isQQ('1234567');
validate.isEmail('a@a.com');

```