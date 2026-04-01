# [1734] Switch uri-js for global URL

**What version of Ajv you are you using?**
8.6.2

**What problem do you want to solve?**
Would like to reduce the dependency and get rid of uri-js https://github.com/ajv-validator/ajv/blob/e055175aa5da2e0f1d811e94ad72044d39eb0836/package.json#L63

**What do you think is the correct solution to problem?**
Using [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL) to validate urls and parsing them.

**Will you be able to implement it?**
No, I don't like TS. I'm supported of type safety with JSDoc and checkJS, but not of it's syntax... it's not valid javascript, Don't run natively in browsers and requires transpiling to worse output