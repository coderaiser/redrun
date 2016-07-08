'use strict';

module.exports = (wildcard) => {
    wildcard    = '^' + wildcard /* search from start of line */
        .replace('.', '\\.')
        .replace('*', '.*')
        .replace('?', '.?');
    
    wildcard    += '$'; /* search to end of line */
    
    const regExp      = RegExp(wildcard);
    
    return regExp;
};

