# Redrun [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Dependency Status][DependencyStatusIMGURL]][DependencyStatusURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

Expand `script` from `package.json` to improve execution speed.

# Usage

```
Usage: redrun [script1 script2 ... scriptN]
Options:
  -p, --parallel  run scripts in parallel
  -s, --series    run scripts in series
  -l, --loud      print resulting command before execute
  -h, --help      display this help and exit
  -v, --version   output version information and exit
```

# How it works

```json
{
    "one": "npm run two",
    "two": "npm run three",
    "three": "echo 'hello'"
}
```

Usually this expressions would be executed one-by-one this way:

```sh
coderaiser@cloudcmd:~/redrun$ npm run one

> redrun@1.0.0 one /home/coderaiser/redrun
> npm run two


> redrun@1.0.0 two /home/coderaiser/redrun
> npm run three


> redrun@1.0.0 three /home/coderaiser/redrun
> echo 'hello'

hello
```

Usually all this steps is slow, becouse every `npm run` it is a new process.
We use `npm run` for comfort of build tools of yesterday (like `gulp` and `grunt`) but without their weacknesses
(a lot dependencies and plugins management frustrations)

What `redrun` does is expand all this commands into one (which is much faster):

```
coderaiser@cloudcmd:~/redrun$ redrun one
redrun: echo 'hello'
hello
```

## Install

```
npm i redrun -g
```

## How to use?

Redrun could be used via command line, scripts section of `package.json` or programmaticly.

```js
let redrun = require('redrun');

redrun('one', {
    one: 'npm run one',
    two: 'npm run three',
    three: 'echo \'hello\''
});

// returns
"echo 'hello'"
```

## Speed comparison
The less spend time is better:

- `npm-run-all`: 0m25.737s
- `npm run && npm run`: 0m24.283s
- `redrun`: 0m16.918s

Here is logs:

### npm-run-all:
```sh
coderaiser@cloudcmd:~/redrun$ time npm run lint

> redrun@1.0.0 lint /home/coderaiser/redrun
> npm-run-all --parallel lint:*


> redrun@1.0.0 lint:eslint-bin /home/coderaiser/redrun
> eslint --rule 'no-console:0' bin


> redrun@1.0.0 lint:jshint /home/coderaiser/redrun
> jshint bin lib


> redrun@1.0.0 lint:jscs /home/coderaiser/redrun
> jscs --esnext bin lib


> redrun@1.0.0 lint:eslint-lib /home/coderaiser/redrun
> eslint lib


real    0m25.737s
user    0m11.372s
sys     0m13.997s
```

### npm run && npm run

```sh
ser@cloudcmd:~/redrun$ time npm run simplelint

> redrun@1.0.0 simplelint /home/coderaiser/redrun
> npm run lint:jshint && npm run lint:eslint-bin && npm run lint:eslint-lib && npm run lint:jscs


> redrun@1.0.0 lint:jshint /home/coderaiser/redrun
> jshint bin lib


> redrun@1.0.0 lint:eslint-bin /home/coderaiser/redrun
> eslint --rule 'no-console:0' bin


> redrun@1.0.0 lint:eslint-lib /home/coderaiser/redrun
> eslint lib


> redrun@1.0.0 lint:jscs /home/coderaiser/redrun
> jscs --esnext bin lib


real    0m24.283s
user    0m11.032s
sys     0m12.695sah
```

### redrun

```sh
coderaiser@cloudcmd:~/redrun$ time npm run redlint

> redrun@1.0.0 redlint /home/coderaiser/redrun
> bin/redrun.js lint:*

redrun: jshint bin lib && eslint --rule 'no-console:0' bin && eslint lib && jscs --esnext bin lib

real    0m16.918s
user    0m7.708s
sys     0m8.868s
```

As you see `redrun` more fast and more laconic then regular solutions.

## License

MIT

[NPMIMGURL]:                https://img.shields.io/npm/v/redrun.svg?style=flat
[BuildStatusIMGURL]:        https://img.shields.io/travis/coderaiser/redrun/master.svg?style=flat
[DependencyStatusIMGURL]:   https://img.shields.io/gemnasium/coderaiser/redrun.svg?style=flat
[LicenseIMGURL]:            https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]:                   https://npmjs.org/package/redrun "npm"
[BuildStatusURL]:           https://travis-ci.org/coderaiser/redrun  "Build Status"
[DependencyStatusURL]:      https://gemnasium.com/coderaiser/redrun "Dependency Status"
[LicenseURL]:               https://tldrlegal.com/license/mit-license "MIT License"

[CoverageURL]:              https://coveralls.io/github/coderaiser/redrun?branch=master
[CoverageIMGURL]:           https://coveralls.io/repos/coderaiser/redrun/badge.svg?branch=master&service=github

