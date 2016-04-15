'use strict';

module.exports = (cmd, fn) => {
    return cmd.replace(/npm run (\w|\:|\s--)+/g, (cmd) => {
        cmd = cmd.replace('npm run ', '');
        cmd = cmd.replace(' --', '');
        return fn(cmd);
    });
};

