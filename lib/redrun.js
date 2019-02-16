'use strict';

const somefilter = require('somefilter');
const currify = require('currify');
const log = require('debug')('redrun:redrun');
const madrun = require('madrun');

const getBody = require('./get-body');
const cliParse = require('./cli-parse');
const replace = require('./replace');
const regexp = require('./regexp');

const parseNpmRedrun = somefilter([
    redrunParse,
    getBody,
]);

const RegExpEnter = regexp.enter;

module.exports = (name, options, scripts) => {
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
    
    if (!name)
        throw Error('name should not be empty!');
    
    if (typeof scripts !== 'object')
        throw Error('json should be object!');
}

function parse(name, options, scripts) {
    let body = getBody(name, options, scripts);
    
    const history = [
        body,
    ];
    
    const expandFn = currify(expand, scripts);
    
    while (RegExpEnter.test(body)) {
        body = replace(body, expandFn);
        
        const infinite = isInfinite(name, history, body);
        
        if (infinite)
            return infinite;
        
        if (~body.indexOf('not a redrun option'))
            break;
    }
    
    log('parse end');
    
    return body;
}

function isInfinite(name, history, body) {
    const i = history.indexOf(body);
    
    history.push(body);
    
    if (i === -1)
        return false;
    
    const n = history.length - 1;
    const loop = history.slice(i, n).join(' -> ');
    
    return `echo "Inifinite loop detected: ${name}: ${loop}"`;
}

function expand(scripts, type, str) {
    if (type === 'npm')
        return parseNpmRedrun(str, scripts);
    
    if (type === 'madrun') {
        const [cmd, args = ''] = str.split(' -- ');
        return madrun.run(cmd, args);
    }
    
    return redrunParse(str, scripts);
}

function redrunParse(str, scripts) {
    const args = str.split(' ');
    const body = scripts[str];
    
    if (body && body.includes(str))
        return `echo "Inifinite loop detected: ${str} -> ${str}"`;
    
    const parsed = cliParse(args, scripts);
    
    return parsed.cmd || `echo ${parsed.output}`;
}

