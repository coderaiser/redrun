'use strict';

const redrun = require('./redrun');
const empty = (a) => !a;
const not = (f) => (a) => !f(a);

module.exports = (names, options, scripts) => {
    if (!scripts) {
        scripts = options;
        options = {};
    }
    
    const parallel = options.parallel;
    const params = options.params || '';
    
    const getScript = (name) => redrun(`${name}${params}`, options, scripts);
    
    const all = names.map(getScript);
    const allFiltered = all.filter(not(empty));
    
    const length = allFiltered.length;
    
    if (!length || ~all.indexOf(null))
        return '';
    
    const symbol = `${parallel ? '&' : '&&'}`;
    return allFiltered.join(` ${symbol} `);
};

