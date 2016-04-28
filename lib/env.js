'use strict';

module.exports.path = (pathEnv, delimiter, cwdEnv, sep) => {
    const result = pathEnv + delimiter + cwdEnv + sep + 'node_modules/.bin';
    
    return result;
};

module.exports.config = (config) => {
    config = config || {};
    const result = Object
        .keys(config)
        .reduce((result, key) => {
            let name = `npm_package_config_${key}`;
            result[name] = config[key];
            return result;
        }, {});
    
    return result;
};

