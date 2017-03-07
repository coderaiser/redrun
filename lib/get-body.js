'use strict';

const currify = require('currify');

const wildcard = require('./wildcard');
const nameRegExp = require('./regexp').name;
const log = require('debug')('redrun:get-body');
const quote = require('./quote-args');

const bodies = currify(bodies_);

module.exports = (name, options, scripts) => {
    if (!scripts) {
        scripts = options;
        options = {};
    }
    
    log(name, nameRegExp);
    
    const script = name.match(nameRegExp)[0] || name;
    const args = name.replace(script, '') || '';
    
    const body = getScripts(script, scripts)
        .map(bodies(scripts, args))
        .map(quote);
        
    const parallel = options.parallel;
    const joiner = ` ${parallel ? '&' : '&&'} `;
    const result = body.join(joiner);
    
    log(`${name} -> ${result}`);
    
    if (!body.length)
        return null;
    
    return result;
};

function getScripts(query, scripts) {
    return Object
        .keys(scripts)
        .filter((name) => {
            return wildcard(query).test(name);
        });
}

function bodies_(scripts, args, name) {
    let inner = scripts[name] + args;
    const pre = scripts[`pre${name}`] || '';
    const post = scripts[`post${name}`] || '';
    
    if (pre)
        inner = `${pre} && ${inner}`;
    
    if (post)
        inner = `${inner} && ${post}`;
     
    return inner;
}

