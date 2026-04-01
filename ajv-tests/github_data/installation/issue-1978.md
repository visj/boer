# [1978] CVE-2021-44906 vulnerability in uri-js dependency

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for installation and dependency issues.
For other issues please see https://ajv.js.org/contributing/

Before submitting the issue, please try the following:
- use the latest stable Node.js and npm
- use yarn instead of npm - the issue can be related to https://github.com/npm/npm/issues/19877
- remove node_modules and package-lock.json and run install again
-->

The CVE-2021-44906 vulnerability is found in stale `uri-js` dependency. https://github.com/garycourt/uri-js/issues/72

**The version of Ajv you are using**
8.11.0

**Operating system and node.js version**
macos
16.15.0

**Package manager and its version**
npm 8.9.0

**Link to (or contents of) package.json**
``` json
{
  "name": "",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "engines": {
    "node": ">=17.9.0",
    "npm": ">=8.9.0"
  },
  "scripts": {
    "lint": "eslint . --fix",
    "test": "c8 mocha",
    "gitHooks": "chmod +x ./.scripts/hooks/pre-commit && git config core.hooksPath ./.scripts/hooks/"
  },
  "license": "UNLICENSED",
  "dependencies": {
    "async": "^3.2.3",
    "axios": "^0.26.1",
    "dollars-to-cents": "^1.0.3",
    "fastify": "^3.29.0",
    "fastify-swagger": "^4.17.1",
    "http-status-codes": "^2.2.0",
    "luxon": "^2.4.0",
    "newrelic": "^8.10.0",
    "postgres": "^3.1.0",
    "redis": "^4.1.0",
    "winston": "^3.7.2"
  },
  "devDependencies": {
    "@babel/eslint-parser": "^7.17.0",
    "@babel/plugin-syntax-import-assertions": "^7.16.7",
    "c8": "^7.11.2",
    "chai": "^4.3.6",
    "chai-as-promised": "^7.1.1",
    "dotenv": "^16.0.1",
    "eslint": "^8.15.0",
    "eslint-config-airbnb-base": "^15.0.0",
    "eslint-plugin-import": "^2.26.0",
    "eslint-plugin-jsdoc": "^39.2.9",
    "esm": "^3.2.25",
    "mocha": "^9.2.2",
    "proxyquire": "^2.1.3",
    "sinon": "^13.0.2"
  },
  "babel": {
    "plugins": [
      "@babel/plugin-syntax-import-assertions"
    ]
  }
}
```

**Error messages**
none

**The output of `npm ls`**
├── @babel/eslint-parser@7.17.0
├── @babel/plugin-syntax-import-assertions@7.16.7
├── async@3.2.3
├── axios@0.26.1
├── c8@7.11.2
├── chai-as-promised@7.1.1
├── chai@4.3.6
├── dollars-to-cents@1.0.3
├── dotenv@16.0.1
├── eslint-config-airbnb-base@15.0.0
├── eslint-plugin-import@2.26.0
├── eslint-plugin-jsdoc@39.2.9
├── eslint@8.15.0
├── esm@3.2.25
├── fastify-swagger@4.17.1
├── fastify@3.29.0
├── http-status-codes@2.2.0
├── luxon@2.4.0
├── mocha@9.2.2
├── newrelic@8.10.0
├── postgres@3.1.0
├── proxyquire@2.1.3
├── redis@4.1.0
├── sinon@13.0.2
└── winston@3.7.2