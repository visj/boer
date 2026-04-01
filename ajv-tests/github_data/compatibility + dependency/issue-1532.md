# [1532] missing sourcemap?

Hi there,

I have an Electron (11) project in which Im using an opensource library named [electron-store](https://github.com/sindresorhus/electron-store) which requires the library [conf](https://github.com/sindresorhus/conf) which requires finally `ajv`.

It seems that on the last updates something happened with the sourcemap of `ajv` and I started to get the following errors:
```
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/ajv.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/context.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/validate/dataType.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/rules.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/validate/applicability.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/errors.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/codegen/index.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/codegen/code.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/codegen/scope.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/names.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/util.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/validate/index.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/validate/boolSchema.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/validate/iterate.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/validate/defaults.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/validate/keyword.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/vocabularies/code.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/subschema.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/resolve.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/uri-js/dist/es5/uri.all.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/core.js.map: Unexpected end of JSON input
DevTools failed to load SourceMap: Could not parse content for app://./Applications/MyApp.app/Contents/Resources/app.asar/node_modules/conf/node_modules/ajv/dist/compile/error_classes.js.map: Unexpected end of JSON input
```

Is there a configuration fix/workaround for that (beside going into electron's devtools and clearing or filtering these warnings)?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
this issue happens on the versions mentioned here below, note that `ajv` is a depndency of a dependency of a dependency 🙃 

`"electron-store": "7.0.2"` 
----------------------------- > requires `"conf": "^9.0.0"`
-------------------------------------------------------------> requires `"ajv": "^7.0.3"`, `"ajv-formats": "^1.5.1"`

**Your code (usage inside [electron-store](https://github.com/sindresorhus/electron-store) -> [conf](https://github.com/sindresorhus/conf) library)**
https://github.com/sindresorhus/conf/blob/ce1dcee195e95cbd71493b1dfd6efcf7fe185a51/source/index.ts#L97-L108


Thanks!
