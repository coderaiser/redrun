#!/usr/bin/env node

'use strict';

const fs = require('fs');
const path = require('path');

const name = path.join(__dirname, '..', 'shell/redrun-completion.sh');
const read = fs.createReadStream(name);
const write = process.stdout;

read.pipe(write);

