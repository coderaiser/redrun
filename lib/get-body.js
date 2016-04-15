'use strict';

let regexp = require('./regexp');

module.exports = (name, scripts) => {
    let script = name.match(/(\w|\:|\*)+/)[0] || name;
    let args = name.replace(script, '') || '';
    
    let body = Object
        .keys(scripts)
        .filter(name => regexp(script).test(name))
        .map(str => {
            let body = scripts[str] + args;
            let pre = scripts[`pre${script}`] || '';
            let post = scripts[`post${script}`] || '';
            
            if (pre)
                body = `${pre} && ${body}`;
            
            if (post)
                body = `${body} && ${post}`;
             
             return body;
        })
        .join(' && ');
    
    return body;
};

