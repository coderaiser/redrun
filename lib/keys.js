'use strict';

module.exports = function keys(divider, obj) {
    if (!obj) {
        obj = divider;
        divider = '.';
    }
    
    check(divider, obj);
    
    return Object.keys(obj).map((key) => {
        let current = obj[key];
        
        if (typeof current === 'object')
            return key + divider + keys(divider, current);
        else
            return key;
    });
}

function check(divider, obj) {
    if (typeof divider !== 'string')
        throw Error('divider should be string!');
    
    if (typeof obj !== 'object')
        throw Error('obj should be object!');
}
