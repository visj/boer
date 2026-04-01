# [2306] Type Error: applicator is not a function

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
Windows 11, node: 18.16.0

**Package manager and its version**
pnpm 8.6.2

**Link to (or contents of) package.json**
`"type": "module",
  "main": "dist/index.js",
  "typings": "dist/index.d.ts",
  "files": [
    "dist"
  ],
  "tsup": {
    "entry": [
      "src/index.ts"
    ],
    "splitting": false,
    "sourcemap": true,
    "clean": true,
    "format": [
      "esm",
      "cjs"
    ],
    "dts": true
  },
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "lint": "eslint src/*.ts*"
  },
  "peerDependencies": {
    "@fortawesome/fontawesome-svg-core": "^6.0.0",
    "@fortawesome/pro-light-svg-icons": "^6.0.0",
    "@fortawesome/pro-regular-svg-icons": "^6.0.0",
    "@fortawesome/pro-solid-svg-icons": "^6.0.0",
    "@fortawesome/react-fontawesome": "^0.2.0",
    "@mui/icons-material": "^5.0.0",
    "@mui/material": "^5.0.0",
    "classnames": "^2.3.1",
    "lodash": "^4.17.21",
    "lodash-es": "^4.17.21",
    "react": ">=18",
    "react-dom": ">=18"
  },
  "dependencies": {
    "@<company>/api": "workspace:*",
    "@<company>/form-controls": "workspace:*",
    "@<company>/formatting": "workspace:*",
    "@rjsf/core": "^5.1.0",
    "@rjsf/utils": "^5.1.0",
    "@rjsf/validator-ajv8": "^5.1.0",
    "animated-scroll-to": "^2.2.0",
    "dompurify": "^2.0.12"
  },
  "devDependencies": {
    "@babel/core": "^7.20.12",
    "@fortawesome/fontawesome-svg-core": "^6.0.0",
    "@fortawesome/pro-light-svg-icons": "^6.0.0",
    "@fortawesome/pro-regular-svg-icons": "^6.0.0",
    "@fortawesome/pro-solid-svg-icons": "^6.0.0",
    "@fortawesome/react-fontawesome": "^0.2.0",
    "@mui/icons-material": "^5.0.0",
    "@mui/material": "^5.0.0",
    "@storybook/react": "^7.0.0",
    "@types/dompurify": "^2.0.2",
    "@types/jest": "^25.2.1",
    "@types/json-schema": "^7.0.11",
    "@types/lodash": "^4.14.192",
    "@types/react": "^18.0.10",
    "@types/react-dom": "^18.0.8",
    "@types/webpack-env": "^1.16.3",
    "classnames": "^2.3.1",
    "dayjs": "^1.11.7",
    "eslint": "^8.12.0",
    "eslint-config-custom": "workspace:*",
    "lodash": "^4.17.21",
    "lodash-es": "^4.17.21",
    "patch-package": "^6.4.7",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "require-from-string": "^2.0.2",
    "tsconfig": "workspace:*",
    "tslib": "^2.3.1",
    "typescript": "^4.6.3",
    "webpack-node-externals": "^3.0.0"
  }
}`

**Error messages**
`Uncaught TypeError: (0 , applicator_1.default) is not a function
    at node_modules/.pnpm/ajv@8.12.0/node_modules/ajv/dist/vocabularies/draft7.js`

I created a package that depends on rjsf forms for use in multiple projects. After trying to upgrade to the latest rjsf recently I am now seeing this error when trying to use my forms package in applications. The project uses pnpm and vite. The package is part of a monorepo using pnpm and turbo. I assume this is a problem with my environment but it would great if someone could confirm that for me somehow.
