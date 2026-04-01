# [2302] Type error: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.

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

**The version of Ajv you are using**

8.12.0

**Operating system and node.js version**

 13.4.1 Ventura  node v16.15.1


**Package manager and its version**
8.11

**Link to (or contents of) package.json**
  "dependencies": {
    "ajv": "^8.12.0",
    "autoprefixer": "10.4.14",
    "eslint-config-next": "13.4.4",
    "guid-ts": "^1.1.2",
    "lodash": "^4.17.21",
    "next": "13.4.4",
    "next-api-decorators": "^2.0.2",
    "path-to-regexp": "^6.2.1",
    "postcss": "8.4.24",
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "rxjs": "^7.8.1",
    "tailwindcss": "3.3.2"
  },
  "devDependencies": {
    "@types/lodash": "^4.14.195",
    "@types/node": "20.2.5",
    "@types/react": "18.2.8",
    "@types/react-dom": "18.2.4",
    "eslint": "8.42.0",
    "ts-json-schema-generator": "^1.2.0",
    "typescript": "5.1.3"
  }
**Error messages**
./node_modules/ajv/lib/ajv.ts:41:3
Type error: Re-exporting a type when 'isolatedModules' is enabled requires using 'export type'.

  39 | 
  40 | export {
> 41 |   Format,
     |   ^
  42 |   FormatDefinition,
  43 |   AsyncFormatDefinition,
  44 |   KeywordDefinition,


**The output of `npm ls`**

The errors in fact is during the project build, but it cause of Nextjs dependency which sets the TS isolated modules to true during compilation all the time.
