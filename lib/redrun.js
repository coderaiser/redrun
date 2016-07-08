'use strict';

const ERROR = 'Too deep traverse. Consider reduce scripts deepness.';

let currify = require('currify');
let log = require('debug')('redrun:redrun');

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
    let i = process.env.REDRUN_DEEP || 1000;
    let body = getBody(name, options, scripts);
    let expandFn = currify(expand, scripts);
    
    while (RegExpEnter.test(body)) {
        log(`parse: ${i}`);
        
        if (i)
            --i;
        else
            throw Error(ERROR);
        
        body = replace(body, expandFn);
        
        if (body.includes('not a redrun option'))
            break;
    }
    
    log('parse end');
    
    return body;
}

function expand(scripts, type, str) {
    let result;
    
    switch(type) {
    case 'npm':
        result = getBody(str, scripts);
        break;
    case 'redrun':
        result = redrunParse(str, scripts);
        break;
    }
    
    return result;
}

function redrunParse(str, scripts) {
    let args = str.split(' ');
    let parsed = cliParse(args, scripts);
    let result = parsed.cmd || `echo ${parsed.output}`;
    
    return result;
}

