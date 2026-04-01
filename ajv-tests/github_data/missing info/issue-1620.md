# [1620] Warning: Accessing non-existent property 'anyOf' of module exports inside circular dependency

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.6 used at serverless


**JSON Schema**

```javascript
{
  type: 'object',
  additionalProperties: false,
  properties: {
    collection: { type: 'string' },
    index: { type: 'string' },
    function: { type: 'string' },
    // following fields has type `boolean` as a workaround that allow use format like:
    // indexes:
    indexes: { type: 'boolean' },
    collections: { type: 'boolean' },
    databases: { type: 'boolean' },
    roles: { type: 'boolean' },
    functions: { type: 'boolean' },
    keys: { type: 'boolean' },
    actions: {
      anyOf: [
        rolePrivilegeSchemaActionsProp,
        rolePrivilegeCollectionActionsProp,
        rolePrivilegeFunctionActionsProp,
        rolePrivilegeIndexActionsProp,
      ],
    },
  },
}
```

**Sample data**

```yml
  roles:
    customer:
      name: customer
      membership: ${self:fauna.collections.customers.name}
      privileges:
        - function: ${self:fauna.functions.submit_order.name}
          actions:
            call: true
```

Getting warnings for nodejs version 15.15.0
```
(node:16280) Warning: Accessing non-existent property 'allOf' of module exports inside circular dependency
(node:16280) Warning: Accessing non-existent property 'anyOf' of module exports inside circular dependency
(node:16280) Warning: Accessing non-existent property 'oneOf' of module exports 
```
with `trace-warning` option
```
(node:64127) Warning: Accessing non-existent property 'oneOf' of module exports inside circular dependency
    at emitCircularRequireWarning (node:internal/modules/cjs/loader:698:11)
    at Object.get (node:internal/modules/cjs/loader:712:5)
    at validate (eval at localCompile (/Users/szinkevych/.nvm/versions/node/v12.18.0/lib/node_modules/serverless/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:35828)
    at validate (eval at localCompile (/Users/szinkevych/.nvm/versions/node/v12.18.0/lib/node_modules/serverless/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:22807)
    at validate (eval at localCompile (/Users/szinkevych/.nvm/versions/node/v12.18.0/lib/node_modules/serverless/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:20584)
    at validate (eval at localCompile (/Users/szinkevych/.nvm/versions/node/v12.18.0/lib/node_modules/serverless/node_modules/ajv/lib/compile/index.js:120:26), <anonymous>:3:20584)
    at Ajv.validate (/Users/szinkevych/.nvm/versions/node/v12.18.0/lib/node_modules/serverless/node_modules/ajv/lib/ajv.js:99:15)
    at Ajv.validateSchema (/Users/szinkevych/.nvm/versions/node/v12.18.0/lib/node_modules/serverless/node_modules/ajv/lib/ajv.js:174:20)
    at Ajv._addSchema (/Users/szinkevych/.nvm/versions/node/v12.18.0/lib/node_modules/serverless/node_modules/ajv/lib/ajv.js:307:10)
    at Ajv.compile (/Users/szinkevych/.nvm/versions/node/v12.18.0/lib/node_modules/serverless/node_modules/ajv/lib/ajv.js:113:24)
    at ConfigSchemaHandler.validateConfig (/Users/szinkevych/.nvm/versions/node/v12.18.0/lib/node_modules/serverless/lib/classes/ConfigSchemaHandler/index.js:106:26)
    at Service.validate (/Users/szinkevych/.nvm/versions/node/v12.18.0/lib/node_modules/serverless/lib/classes/Service.js:229:41)
    at Serverless.run (/Users/szinkevych/.nvm/versions/node/v12.18.0/lib/node_modules/serverless/lib/Serverless.js:324:39)
    at /Users/szinkevych/.nvm/versions/node/v12.18.0/lib/node_modules/serverless/scripts/serverless.js:704:26
    at processTicksAndRejections (node:internal/process/task_queues:94:5)
``

warning not shown for nodejs version 12.18


**What results did you expect?**
no warnings
