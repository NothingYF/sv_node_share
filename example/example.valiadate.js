const validate = require('../index').validate;

const example = async()=>{
    validate.isEmail('1@1');
    validate.isMobile('13600000000');
    validate.isIP('10.0.0.1');
}

example();