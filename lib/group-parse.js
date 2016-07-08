'use strict';

const redrun = require('./redrun');

module.exports = (names, options, scripts) => {
    if (!scripts) {
        scripts = options;
        options = {};
    }
    
    let result = '';
    
    const parallel    = options.parallel;
    const all         = names.map((name) => {
        return redrun(name, options, scripts);
    }).filter((name) => {
        return name;
    });
    
    if (all.length) {
        const symbol = `${parallel ? '&' : '&&'}`;
        result = all.join(` ${symbol} `);
    }
    
    return result;
};

