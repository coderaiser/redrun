'use strict';

module.exports = function (divider, obj) {
    if (!obj) {
        obj = divider;
        divider = '.';
    }
    
    check(divider, obj);
    
    return keys(divider, obj);
}

function check(divider, obj) {
    if (typeof divider !== 'string')
        throw Error('divider should be string!');
    
    if (typeof obj !== 'object')
        throw Error('obj should be object!');
}

function keys(divider, path, obj, array) {
    if (!array)
        array = [];
    
    if (!obj) {
        obj = path;
        path = '';
    }
    
    if (typeof obj !== 'object')
        array.push(path);
    else
        Object.keys(obj).forEach((key) => {
            let current = !path ? key : [path, key].join(divider);
            keys(divider, current, obj[key], array);
        });
    
    return array;
}
