'use strict';

const redrun = require('./redrun');

module.exports = (names, options, scripts) => {
    if (!scripts) {
        scripts = options;
        options = {};
    }
    
    let result = '';
    
    const parallel    = options.parallel;
    const params    = options.params || '';
    
    let fail;
    
    const all         = names.map((name) => {
        const result = redrun(`${name}${params}`, options, scripts);
        
        if (result === null)
            fail = true;
        
        return result;
    }).filter((name) => {
        return name;
    });
    
    if (all.length) {
        const symbol = `${parallel ? '&' : '&&'}`;
        result = all.join(` ${symbol} `);
    }
    
    if (fail)
        return '';
    
    return result;
};

