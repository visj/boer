# [941] NPM: 6.9.0 AJV Commit causing failure to execute node_modules (multiple dependencies affected i.e. ESLint and WebPack Loaders)

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest version (6.9.0 release I believe)

**Ajv options object**
```
node_modules/ajv/lib/keyword.js:65
      throw new Error('custom keyword definition is invalid: '  + this.errorsText(validateDefinition.errors));
      ^

Error: custom keyword definition is invalid: data.errors should be boolean
    at Ajv.addKeyword (/home/mmacheerpuppy/git/fsa/react-application/node_modules/ajv/lib/keyword.js:65:13)
    at module.exports (/home/mmacheerpuppy/git/fsa/react-application/node_modules/ajv-errors/index.js:10:7)
    at Object.<anonymous> (/home/mmacheerpuppy/git/fsa/react-application/node_modules/schema-utils/src/validateOptions.js:22:1)
    at Module._compile (module.js:652:30)
    at Object.Module._extensions..js (module.js:663:10)
    at Module.load (module.js:565:32)
    at tryModuleLoad (module.js:505:12)
    at Function.Module._load (module.js:497:3)
    at Module.require (module.js:596:17)
    at require (internal/module.js:11:18)
```

**What results did you expect?**

Expected to be able to build node_modules but experiencing above stacktrace.

**Are you going to resolve the issue?**
Current workaround is to remove ESLint dependencies for NPM users, or if using YARN to resolve dependencies to forced version. It's also possible (with the addition of _another_ dependency) to use NPM resolutions (see conversation).

**Reproduction**

Try using the following packages declaration. npm post install will fail to start. ESLint relies on AJV.

```
{
  "name": "food-standards",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    
    "axios": "^0.18.0",
    "bootstrap": "^4.2.1",
    "react": "^16.8.1",
    "react-dom": "^16.8.1",
    "react-scripts": "2.1.3",
    "reactstrap": "^7.1.0"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": "react-app"
  },
  "browserslist": [
    ">0.2%",
    "not dead",
    "not ie <= 11",
    "not op_mini all"
  ],
  "devDependencies": {
    "axios-mock-adapter": "^1.16.0",
    "eslint": "5.6.0",
    "eslint-config-airbnb": "^17.1.0",
    "eslint-plugin-import": "^2.14.0",
    "eslint-plugin-jsx-a11y": "^6.1.1",
    "eslint-plugin-react": "^7.11.0",
    "react-testing-library": "^5.5.3"
  }
}
```