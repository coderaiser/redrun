'use strict';

const ERROR = 'Too deep traverse. Consider reduce scripts deepness.';

let getBody = require('./get-body');
let replace = require('./replace');

module.exports  = (name, json) => {
    check(name, json);
    return parse(name, json.scripts);
};

function check(name, json) {
    if (typeof name !== 'string')
        throw Error('name should be string!');
    
    if (typeof json !== 'object')
        throw Error('json should be object!');
}

function parse(name, scripts) {
    let i = 1000;
    let body = getBody(name, scripts);
    let expand = (str) => getBody(str, scripts);
    
    while (body.includes('npm run ')) {
        if (i)
            --i;
        else
            throw Error(ERROR);
        
        body = replace(body, expand);
    }
    
    return body;
}

