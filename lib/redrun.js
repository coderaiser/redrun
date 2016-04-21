'use strict';

const ERROR = 'Too deep traverse. Consider reduce scripts deepness.';

let getBody = require('./get-body');
let replace = require('./replace');

module.exports  = (name, options, json) => {
    if (!json) {
        json = options;
        options = {};
    }
    
    check(name, options, json);
    
    return parse(name, options, json.scripts);
};

function check(name, options, json) {
    if (typeof name !== 'string')
        throw Error('name should be string!');
    
    if (typeof options !== 'object')
        throw Error('options should be object!');

    if (typeof json !== 'object')
        throw Error('json should be object!');
}

function parse(name, options, scripts) {
    let i = 1000;
    let body = getBody(name, options, scripts);
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

