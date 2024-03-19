import currify from 'currify';
import wildcard from './wildcard.js';
import {name as nameRegExp, enter as regEnter} from './regexp.js';
import debug from 'debug';
import quote from './quote-args.js';

const log = debug('redrun:get-body');

const bodies = currify(bodies_);

export default (name, options, scripts) => {
    if (!scripts) {
        scripts = options;
        options = {};
    }
    
    log(name, nameRegExp);
    
    const [script] = name.match(nameRegExp);
    const args = name.replace(script, '') || '';
    
    const body = getScripts(script, scripts)
        .map(bodies(scripts, args))
        .map(quote);
    
    const {parallel} = options;
    const joiner = ` ${parallel ? '&' : '&&'} `;
    const result = body.join(joiner);
    
    log(`${name} -> ${result}`);
    
    if (!body.length)
        return null;
    
    return result;
};

function getScripts(query, scripts) {
    const test = (name) => {
        return wildcard(query).test(name);
    };
    
    return Object
        .keys(scripts)
        .filter(test);
}

function bodies_(scripts, args, name) {
    let inner = scripts[name];
    
    if (args && regEnter.test(inner))
        inner += ' --';
    
    if (args)
        inner += args;
    
    const pre = scripts[`pre${name}`] || '';
    const post = scripts[`post${name}`] || '';
    
    if (pre)
        inner = `${pre} && ${inner}`;
    
    if (post)
        inner = `${inner} && ${post}`;
    
    return inner;
}
