'use strict';

const redrun = require('./redrun');
const log = require('debug')('redrun:group-parse');
const {stringify} = JSON;

const empty = (a) => !a;
const not = (f) => (a) => !f(a);

module.exports = (names, options, scripts) => {
    if (!scripts) {
        scripts = options;
        options = {};
    }
    
    log(`names ${names}`);
    log(`scripts ${stringify(scripts)}`);
    log(`options ${stringify(options)}`);
    
    const {
        parallel,
        params = '',
    } = options;
    
    const getScript = (name) => {
        return redrun(`${name}${params}`, options, scripts);
    };
    
    const all = names.map(getScript);
    const allFiltered = all.filter(not(empty));
    
    const {length} = allFiltered;
    
    if (!length || ~all.indexOf(null))
        return '';
    
    const symbol = parallel ? '&' : '&&';
    return allFiltered.join(` ${symbol} `);
};

