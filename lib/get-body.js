'use strict';

let wildcard = require('./wildcard');
let nameRegExp = require('./regexp').name;
let log = require('debug')('redrun:get-body');

module.exports = (name, options, scripts) => {
    if (!scripts) {
        scripts = options;
        options = {};
    }
    
    log(name, nameRegExp)
    
    let script = name.match(nameRegExp)[0] || name;
    let args = name.replace(script, '') || '';
    
    let body = Object
        .keys(scripts)
        .filter(name => wildcard(script).test(name))
        .map(str => {
            let body = scripts[str] + args;
            let pre = scripts[`pre${script}`] || '';
            let post = scripts[`post${script}`] || '';
            
            if (pre)
                body = `${pre} && ${body}`;
            
            if (post)
                body = `${body} && ${post}`;
             
             return body;
        });
       
        let parallel = options.parallel;
        let joiner = ` ${parallel ? '&' : '&&'} `;
        let result = body.join(joiner);
    
    log(`${name} -> ${result}`);
    
    return result;
};

