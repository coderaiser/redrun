'use strict';

const ERROR = 'Too deep traverse. Consider reduce scripts deepness.';

let currify = require('currify');

let getBody = require('./get-body');
let cliParse = require('./cli-parse');
let replace = require('./replace');
let regexp = require('./regexp');

let RegExpEnter = regexp.enter;

module.exports  = (name, options, scripts) => {
    if (!scripts) {
        scripts = options;
        options = {};
    }
    
    check(name, options, scripts);
    
    return parse(name, options, scripts);
};

function check(name, options, scripts) {
    if (typeof name !== 'string')
        throw Error('name should be string!');
    
    if (typeof scripts !== 'object')
        throw Error('json should be object!');
}

function parse(name, options, scripts) {
    let i = 1000;
    let body = getBody(name, options, scripts);
    let expandFn = currify(expand, scripts);
    
    while (RegExpEnter.test(body)) {
        if (i)
            --i;
        else
            throw Error(ERROR);
        
        body = replace(body, expandFn);
    }
    
    return body;
}

function expand(scripts, type, str) {
    let result;
    
    switch(type) {
    case 'npm':
        result = getBody(str, scripts);
        break;
    case 'redrun':
        let parsed = cliParse(str.split(' '), scripts);
        result = parsed.cmd || `echo ${parsed.output}`;
        break;
    default:
        result = str;
        break;
    }
    
    return result;
}

