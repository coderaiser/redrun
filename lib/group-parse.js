'use strict';

const redrun = require('./redrun');
const log = require('debug')('redrun:group-parse');
const {stringify} = JSON;

module.exports = async (names, options, scripts) => {
    if (!scripts) {
        scripts = options;
        options = {};
    }
    
    log(`names ${names}`);
    log(`scripts ${stringify(scripts)}`);
    log(`options ${stringify(options)}`);
    
    const {parallel, params = ''} = options;
    
    const all = [];
    
    for (const name of names) {
        const script = await redrun(`${name}${params}`, options, scripts);
        all.push(script);
    }
    
    const allFiltered = all.filter(Boolean);
    
    const {length} = allFiltered;
    
    if (!length || all.includes(null))
        return '';
    
    const symbol = parallel ? '&' : '&&';
    
    return allFiltered.join(` ${symbol} `);
};
