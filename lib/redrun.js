import debug from 'debug';
import _madrun from 'madrun';
import getBody from './get-body.js';
import cliParse from './cli-parse.js';
import replace from './replace.js';
import * as regexp from './regexp.js';

const log = debug('redrun:redrun');
const isString = (a) => typeof a === 'string';
const RegExpEnter = regexp.enter;

export default async (name, options, scripts, {madrun = _madrun} = {}) => {
    if (!scripts) {
        scripts = options;
        options = {};
    }
    
    check(name, options, scripts);
    
    return await parse(name, options, scripts, {
        madrun,
    });
};

function check(name, options, scripts) {
    if (!isString(name))
        throw Error('name should be string!');
    
    if (!name)
        throw Error('name should not be empty!');
    
    if (typeof scripts !== 'object')
        throw Error('json should be object!');
}

async function parse(name, options, scripts, {madrun} = {}) {
    let body = getBody(name, options, scripts);
    
    const history = [body];
    
    const expandFn = expand(scripts, {
        madrun,
    });
    
    while (RegExpEnter.test(body)) {
        body = await replace(body, expandFn);
        
        const infinite = isInfinite(name, history, body);
        
        if (infinite)
            return infinite;
        
        if (body.includes('not a redrun option'))
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
    
    const loop = history
        .slice(i, n)
        .join(' -> ');
    
    return `echo "Inifinite loop detected: ${name}: ${loop}"`;
}

const expand = (scripts, {madrun = _madrun} = {}) => async (type, str) => {
    if (type === 'npm')
        return getBody(str, scripts) || await redrunParse(str, scripts);
    
    if (type === 'madrun') {
        const [cmd, args = ''] = str.split(' -- ');
        return await madrun.run(cmd, args);
    }
    
    return await redrunParse(str, scripts);
};

async function redrunParse(str, scripts) {
    const args = str.split(' ');
    const body = scripts[str];
    
    if (body?.includes(str))
        return `echo "Inifinite loop detected: ${str} -> ${str}"`;
    
    const parsed = await cliParse(args, scripts);
    
    return parsed.cmd || `echo ${parsed.output}`;
}
