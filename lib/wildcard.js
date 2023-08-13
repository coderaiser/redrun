'use strict';

module.exports = (str) => {
    const wildcard = `^${str
        .replace('.', '\\.')
        .replace('*', '.*')
        .replace('?', '.?')}$`;
    
    return RegExp(wildcard);
};
