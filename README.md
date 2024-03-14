# Redrun [![License][LicenseIMGURL]][LicenseURL] [![NPM version][NPMIMGURL]][NPMURL] [![Build Status][BuildStatusIMGURL]][BuildStatusURL] [![Coverage Status][CoverageIMGURL]][CoverageURL]

[NPMIMGURL]: https://img.shields.io/npm/v/redrun.svg?style=flat
[BuildStatusURL]: https://github.com/coderaiser/redrun/actions?query=workflow%3A%22Node+CI%22 "Build Status"
[BuildStatusIMGURL]: https://github.com/coderaiser/redrun/workflows/Node%20CI/badge.svg
[LicenseIMGURL]: https://img.shields.io/badge/license-MIT-317BF9.svg?style=flat
[NPMURL]: https://npmjs.org/package/redrun "npm"
[LicenseURL]: https://tldrlegal.com/license/mit-license "MIT License"
[CoverageURL]: https://coveralls.io/github/coderaiser/redrun?branch=master
[CoverageIMGURL]: https://coveralls.io/repos/coderaiser/redrun/badge.svg?branch=master&service=github

CLI tool to run multiple npm-scripts fast. Supports madly comfortable 🏎 [**Madrun**](https://github.com/coderaiser/madrun).

![Redrun](https://github.com/coderaiser/redrun/raw/master/redrun.png "Redrun")

## Install

```
npm i redrun -g
```

# Usage

```
Usage: redrun [...tasks] [options] [-- ...args]
Options:
  -p, --parallel          run scripts in parallel
  -s, --series            run scripts in series
  -q, --quiet             do not output result command before execution
  -c, --calm              return zero exit code when command completed with error
  -P, --parallel-calm     run scripts in parallel and return zero exit code
  -S, --series-calm       run scripts in series and return zero exit code
  -h, --help              display this help and exit
  -v, --version           output version information and exit
```

# Completion

You can enable tab-completion of npm scripts similar to [npm's completion](https://docs.npmjs.com/cli/completion) using:

```sh
redrun-completion >> ~/.bashrc
redrun-completion >> ~/.zshrc
```

You may also pipe the output of redrun-completion to a file such as `/usr/local/etc/bash_completion.d/redrun` if you have a system that will read that file for you.

# How it works

`package.json`:
```json
{
  "scripts":
  {
      "one": "npm run two",
      "two": "npm run three",
      "three": "echo 'hello'"
  }
}
```

Usually these expressions would be executed one after another:

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

All these `npm run` commands that are created are slow, because each time it creates a new process.

`redrun` makes it faster:

```
coderaiser@cloudcmd:~/redrun$ redrun one
> echo 'hello'
hello
```

## How to use?

Redrun could be used via the command line, the scripts section of `package.json` or in a script:

```js
import redrun from 'redrun';

await redrun('one', {
    one: 'npm run two',
    two: 'npm run three',
    three: `echo 'hello'`,
});

// returns
`echo 'hello'`;

await redrun('one', {
    one: 'redrun -p two three',
    two: 'redrun four five',
    three: `echo 'hello'`,
    four: 'jshint lib',
    five: 'jscs test',
});

// returns
`jshint lib && jscs test & echo 'hello'`;
```

## Speed comparison

The less spend time is better:

- `npm-run-all`: 1m12.570s
- `npm run && npm run`: 1m10.727s
- `redrun`: 0m38.312s

Here are logs:

### npm-run-all:

```sh
coderaiser@cloudcmd:~/redrun$ time npm run speed:npm-run-all

> speed:npm-run-all /home/coderaiser/redrun
> npm-run-all lint:*


> redrun@5.3.0 lint:jshint /home/coderaiser/redrun
> jshint bin lib test


> redrun@5.3.0 lint:eslint-bin /home/coderaiser/redrun
> eslint --rule 'no-console:0' bin


> redrun@5.3.0 lint:eslint-lib /home/coderaiser/redrun
> eslint lib test


> redrun@5.3.0 lint:jscs /home/coderaiser/redrun
> jscs --esnext bin lib test


real    1m12.570s
user    0m14.431s
sys     0m17.147s
```

### npm run && npm run

```sh
coderaiserser@cloudcmd:~/redrun$ time npm run speed:npm-run

redrun@5.3.0 speed:npm-run /home/coderaiser/redrun
> npm run lint:jshint && npm run lint:eslint-bin && npm run lint:eslint-lib && npm run lint:jscs


> redrun@5.3.0 lint:jshint /home/coderaiser/redrun
> jshint bin lib test


> redrun@5.3.0 lint:eslint-bin /home/coderaiser/redrun
> eslint --rule 'no-console:0' bin


> redrun@5.3.0 lint:eslint-lib /home/coderaiser/redrun
> eslint lib test


> redrun@5.3.0 lint:jscs /home/coderaiser/redrun
> jscs --esnext bin lib test


real    1m10.727s
user    0m14.670s
sys     0m16.663s
```

### redrun

```sh
coderaiser@cloudcmd:~/redrun$ redrun lint:*
> jshint bin lib test && eslint --rule 'no-console:0' bin && eslint lib test && jscs --esnext bin lib test

real    0m38.312s
user    0m8.198s
sys     0m9.113s
```

As you can see `redrun` is much faster and more DRY way of using `npm scripts` than regular solutions.

## Related

- [madrun](https://github.com/coderaiser/madrun) - CLI tool to run multiple npm-scripts in a madly comfortable way.

## License

MIT
