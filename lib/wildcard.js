'use strict';

module.exports = (str) => {
    const wildcard = '^' + str/* search from start of line */
        .replace('.', '\\.')
        .replace('*', '.*')
        .replace('?', '.?') + '$'; /* search to end of line */
    
    return RegExp(wildcard);
};

