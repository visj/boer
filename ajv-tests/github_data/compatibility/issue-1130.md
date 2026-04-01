# [1130] Can't run tests

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.10.2


**Ajv options object**
NA.
This issue is with tests.

I clone the repo.
I install node 12.13.1 (LTS)
I run `npm install` and `git submodule update --init`.
I run `npm test`.

I get the following error logs...

<details><summary>.npm/_logs/2019-12-03T13_11_47_708Z-debug.log</summary>

```
0 info it worked if it ends with ok
1 verbose cli [
1 verbose cli   '/Users/bh7/.nvm/versions/node/v12.13.1/bin/node',
1 verbose cli   '/Users/bh7/.nvm/versions/node/v12.13.1/bin/npm',
1 verbose cli   'run',
1 verbose cli   'test-all'
1 verbose cli ]
2 info using npm@6.12.1
3 info using node@v12.13.1
4 verbose run-script [ 'pretest-all', 'test-all', 'posttest-all' ]
5 info lifecycle ajv@6.10.2~pretest-all: ajv@6.10.2
6 info lifecycle ajv@6.10.2~test-all: ajv@6.10.2
7 verbose lifecycle ajv@6.10.2~test-all: unsafe-perm in lifecycle true
8 verbose lifecycle ajv@6.10.2~test-all: PATH: [all the path stuff]
9 verbose lifecycle ajv@6.10.2~test-all: CWD: /Users/bh7/projects/JSON Schema/ajv
10 silly lifecycle ajv@6.10.2~test-all: Args: [
10 silly lifecycle   '-c',
10 silly lifecycle   'npm run test-ts && npm run test-cov && if-node-version 10 npm run test-browser'
10 silly lifecycle ]
11 silly lifecycle ajv@6.10.2~test-all: Returned: code: 1  signal: null
12 info lifecycle ajv@6.10.2~test-all: Failed to exec test-all script
13 verbose stack Error: ajv@6.10.2 test-all: `npm run test-ts && npm run test-cov && if-node-version 10 npm run test-browser`
13 verbose stack Exit status 1
13 verbose stack     at EventEmitter.<anonymous> (/Users/bh7/.nvm/versions/node/v12.13.1/lib/node_modules/npm/node_modules/npm-lifecycle/index.js:332:16)
13 verbose stack     at EventEmitter.emit (events.js:210:5)
13 verbose stack     at ChildProcess.<anonymous> (/Users/bh7/.nvm/versions/node/v12.13.1/lib/node_modules/npm/node_modules/npm-lifecycle/lib/spawn.js:55:14)
13 verbose stack     at ChildProcess.emit (events.js:210:5)
13 verbose stack     at maybeClose (internal/child_process.js:1021:16)
13 verbose stack     at Process.ChildProcess._handle.onexit (internal/child_process.js:283:5)
14 verbose pkgid ajv@6.10.2
15 verbose cwd /Users/bh7/projects/JSON Schema/ajv
16 verbose Darwin 17.7.0
17 verbose argv "/Users/bh7/.nvm/versions/node/v12.13.1/bin/node" "/Users/bh7/.nvm/versions/node/v12.13.1/bin/npm" "run" "test-all"
18 verbose node v12.13.1
19 verbose npm  v6.12.1
20 error code ELIFECYCLE
21 error errno 1
22 error ajv@6.10.2 test-all: `npm run test-ts && npm run test-cov && if-node-version 10 npm run test-browser`
22 error Exit status 1
23 error Failed at the ajv@6.10.2 test-all script.
23 error This is probably not a problem with npm. There is likely additional logging output above.
24 verbose exit [ 1, true ]
/Users/bh7/.npm/_logs/2019-12-03T13_11_47_708Z-debug.log (END)
```
</details>

<details><summary>.npm/_logs/2019-12-03T13_11_47_682Z-debug.log</summary>

```
0 info it worked if it ends with ok
1 verbose cli [
1 verbose cli   '/Users/bh7/.nvm/versions/node/v12.13.1/bin/node',
1 verbose cli   '/Users/bh7/.nvm/versions/node/v12.13.1/bin/npm',
1 verbose cli   'run',
1 verbose cli   'test-ts'
1 verbose cli ]
2 info using npm@6.12.1
3 info using node@v12.13.1
4 verbose run-script [ 'pretest-ts', 'test-ts', 'posttest-ts' ]
5 info lifecycle ajv@6.10.2~pretest-ts: ajv@6.10.2
6 info lifecycle ajv@6.10.2~test-ts: ajv@6.10.2
7 verbose lifecycle ajv@6.10.2~test-ts: unsafe-perm in lifecycle true
8 verbose lifecycle ajv@6.10.2~test-ts: PATH: [all the path stuff]
9 verbose lifecycle ajv@6.10.2~test-ts: CWD: /Users/bh7/projects/JSON Schema/ajv
10 silly lifecycle ajv@6.10.2~test-ts: Args: [
10 silly lifecycle   '-c',
10 silly lifecycle   'tsc --target ES5 --noImplicitAny --noEmit spec/typescript/index.ts'
10 silly lifecycle ]
11 silly lifecycle ajv@6.10.2~test-ts: Returned: code: 1  signal: null
12 info lifecycle ajv@6.10.2~test-ts: Failed to exec test-ts script
13 verbose stack Error: ajv@6.10.2 test-ts: `tsc --target ES5 --noImplicitAny --noEmit spec/typescript/index.ts`
13 verbose stack Exit status 1
13 verbose stack     at EventEmitter.<anonymous> (/Users/bh7/.nvm/versions/node/v12.13.1/lib/node_modules/npm/node_modules/npm-lifecycle/index.js:332:16)
13 verbose stack     at EventEmitter.emit (events.js:210:5)
13 verbose stack     at ChildProcess.<anonymous> (/Users/bh7/.nvm/versions/node/v12.13.1/lib/node_modules/npm/node_modules/npm-lifecycle/lib/spawn.js:55:14)
13 verbose stack     at ChildProcess.emit (events.js:210:5)
13 verbose stack     at maybeClose (internal/child_process.js:1021:16)
13 verbose stack     at Process.ChildProcess._handle.onexit (internal/child_process.js:283:5)
14 verbose pkgid ajv@6.10.2
15 verbose cwd /Users/bh7/projects/JSON Schema/ajv
16 verbose Darwin 17.7.0
17 verbose argv "/Users/bh7/.nvm/versions/node/v12.13.1/bin/node" "/Users/bh7/.nvm/versions/node/v12.13.1/bin/npm" "run" "test-ts"
18 verbose node v12.13.1
19 verbose npm  v6.12.1
20 error code ELIFECYCLE
21 error errno 1
22 error ajv@6.10.2 test-ts: `tsc --target ES5 --noImplicitAny --noEmit spec/typescript/index.ts`
22 error Exit status 1
23 error Failed at the ajv@6.10.2 test-ts script.
23 error This is probably not a problem with npm. There is likely additional logging output above.
24 verbose exit [ 1, true ]
```
</details>

I cursuary google suggested it could be a typescript issue.

I tried to re-run the tests having installed typescript 3. No joy.

(Please come find me on slack to discuss =] - Otherwise I'll likely find a reply weeks later...)