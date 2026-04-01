# [747] ajv@6.4.0 doesn't support Node v4

In Node.js v4, `yarn` cannot install ajv:
```console
$ yarn add ajv
yarn add v1.5.1
[1/5] 🔍  Validating package.json...
[2/5] 🔍  Resolving packages...
[3/5] 🚚  Fetching packages...
error punycode@2.1.0: The engine "node" is incompatible with this module. Expected version ">=6".                                               
error An unexpected error occurred: "Found incompatible module".
info If you think this is a bug, please open a bug report with the information provided in "/Users/teppeis/src/github.com/teppeis/kintone-plugin-manifest-validator/yarn-error.log".
info Visit https://yarnpkg.com/en/docs/cli/add for documentation about this command.
```

also `npm` warns:
```console
$ npm install ajv
npm WARN engine punycode@2.1.0: wanted: {"node":">=6"} (current: {"node":"4.8.7","npm":"2.15.11"})
ajv@6.4.0 node_modules/ajv
+-- json-schema-traverse@0.3.1
+-- fast-deep-equal@1.1.0
+-- fast-json-stable-stringify@2.0.0
`-- uri-js@3.0.2 (punycode@2.1.0)
```

#544 introduces `uri-js` and it requires `punycode` that doesn't support Node v4.

IMO ajv can drop support Node v4 (the EOL is next month, April 2018).
It would be better to add `engines` field to `package.json` of ajv.