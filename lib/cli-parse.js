'use strict'; 

let redrun = require('./redrun');

module.exports = (names, options, scripts) => {
    if (!scripts) {
        scripts = options;
        options = {};
    }
    
    let result      = '';
    let parallel    = options.parallel;
    let all         = names.map((name) => {
        return redrun(name, options, scripts);
    }).filter((name) => {
        return name;
    });
    
    if (all.length) {
        let symbol = `${parallel ? '&' : '&&'}`;
        result = all.join(` ${symbol} `);
    }
    
    return result;
}

