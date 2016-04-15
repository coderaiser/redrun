'use strict';

module.exports = (wildcard) => {
    let regExp;
    
    wildcard    = '^' + wildcard /* search from start of line */
        .replace('.', '\\.')
        .replace('*', '.*')
        .replace('?', '.?');
    
    wildcard    += '$'; /* search to end of line */
    
    regExp      = RegExp(wildcard);
    
    return regExp;
};

