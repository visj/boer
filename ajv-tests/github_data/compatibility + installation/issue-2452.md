# [2452] Error: Cannot find module 'ajv/dist/core'

Our app started to fail when dependencies are installed by npm (works with yarn & pnpm) 

```
Error: Cannot find module 'ajv/dist/core'
Require stack:
Require stack:
- /project/node_modules/ajv-draft-04/dist/index.js
- /project/node_modules/@rushstack/node-core-library/lib/JsonSchema.js
- /project/node_modules/@rushstack/node-core-library/lib/index.js
- /project/node_modules/@rushstack/terminal/lib/NormalizeNewlinesTextRewriter.js
- /project/node_modules/@rushstack/terminal/lib/index.js
- /project/node_modules/@rushstack/ts-command-line/lib/providers/CommandLineParser.js
- /project/node_modules/@rushstack/ts-command-line/lib/providers/ScopedCommandLineAction.js
- /project/node_modules/@rushstack/ts-command-line/lib/index.js
- /project/node_modules/umzug/lib/cli.js
- /project/node_modules/umzug/lib/umzug.js
- /project/node_modules/umzug/lib/index.js
```


I tried installing the dependencies with --force & --legacy-peer-deps with no success. 


```
  ├─┬ project
  │ └─┬ umzug@3.2.1
  │   └─┬ @rushstack/ts-command-line@4.22.0
  │     └─┬ @rushstack/terminal@0.13.0
  │       └─┬ @rushstack/node-core-library@5.4.1
  │         ├─┬ ajv-draft-04@1.0.0
  │         │ └── ajv@6.12.6 deduped invalid: "^8.5.0" from node_modules/ajv-draft-04
  │         ├─┬ ajv-formats@3.0.1
  │         │ └── ajv@8.16.0
  │         └── ajv@8.13.0
 
```

it seems that ajv-draft-04 has an invalid peer dep config (or npm doesn't know what to do with it ?) that resolves to and old version of ajv instead of the right one. 

Let me know if I can provide more information :)
