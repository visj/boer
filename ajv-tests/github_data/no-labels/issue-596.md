# [596] Testing issues - what is the proper way to verify work? (question/advice)

### What is the proper way to test/verify work? 

I would like to contribute to #526 and have changed the $data file names and the `requires ` statements that call them. All build fine, but I'm looking for any help, advice or suggestions on the proper way to test my work before thinking about a pull-request.

 `npm run build` :  compiles fine.
 `npm run test` : over 8000 CRLF to LF errors. i removed   `linebreak-style: [2, unix] `from eslintrc.yml and gets me through

`npm run test` again :  jshint says the following:
> 
> ERROR: Can't open lib/*.js
> ERROR: Can't open lib/**/*.js

I tried unmarking the folders as readonly, no luck...

`npm run test-spec` :  I receive  `--  bad option: --harmony-async-await)`

 `npm run test-browser` >`'scripts' is not recognized as an internal or external command`.


I've tried  performing this worklow in the readme.md file both before and after my changes with no luck.
> `npm install`
> `git submodule update --init`
> `npm test`

Any help or advice would be appreciated.
