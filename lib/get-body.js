'use strict';

const wildcard = require('./wildcard');
const nameRegExp = require('./regexp').name;
const log = require('debug')('redrun:get-body');
const quote = require('./quote-args');

module.exports = (name, options, scripts) => {
    if (!scripts) {
        scripts = options;
        options = {};
    }
    
    log(name, nameRegExp);
    
    const script = name.match(nameRegExp)[0] || name;
    const args = name.replace(script, '') || '';
    
    const body = Object
        .keys(scripts)
        .filter((name) => {
            return wildcard(script).test(name);
        })
        .map(bodies(script, scripts, args))
        .map(quote);
       
    const parallel = options.parallel;
    const joiner = ` ${parallel ? '&' : '&&'} `;
    const result = body.join(joiner);
    
    log(`${name} -> ${result}`);
    
    if (!body.length)
        return null;
    
    return result;
};

function bodies(script, scripts, args) {
    return (str) => {
        let inner = scripts[str] + args;
        const pre = scripts[`pre${script}`] || '';
        const post = scripts[`post${script}`] || '';
        
        if (pre)
            inner = `${pre} && ${inner}`;
        
        if (post)
            inner = `${inner} && ${post}`;
         
        return inner;
    };
}

