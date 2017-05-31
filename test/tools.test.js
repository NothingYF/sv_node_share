/**
 * Created by Nothing on 2017/6/1.
 */
const assert = require('assert');
const tools = require('../common/tools');

describe('common/tool.js', function () {

    describe('#isJSON()', function () {
        it('should validate isJSON', async function () {
            let obj = {name: 'test'};
            let res = tools.isJSON(obj);
            assert.equal(res, true);
        })
    });

    describe('#sleep()', function () {
        it('should test sleep', async function () {
            
        })
    });
    

    describe('#formatTime()', function () {
        it('should formatTime', async function () {
            let exp = 'YYYY/MM/DD HH/mm/ss';
            let time = await tools.formatTime(exp);
            assert.notEqual(time, null);
        })
    });

    describe('#exec()', function () {
        it('should execude cmd', async function () {
           await tools.exec('netstat -an');
       })
    });

    describe('#sysinfo()', function () {
        it('should get sysinfo', async function () {
            let res = await tools.sysinfo();
            assert.notEqual(res, null);
        })
    });

    describe('#encrypt()', function () {
        it('should encrypt', async function () {
            let str = '123456';
            let res = await tools.encrypt(str,'12121');
            assert.notEqual(res, str);
        })
    });

    describe('#decrypt()', function () {
        it('should decrypt', async function () {
            let str = 'e1b4fdba20a4bcd800a2e989e3a0ee38';
            let res = await tools.decrypt(str,'12121');
            assert.equal(res, '123456');
        })
    });

    describe('#md5()', function () {
        it('should test md5', async function () {
            let str = '123456';
            let res = await tools.md5(str);
            assert.notEqual(res, 'e1b4fdba20a4bcd800a2e989e3a0ee38');
        })
    });
    
});