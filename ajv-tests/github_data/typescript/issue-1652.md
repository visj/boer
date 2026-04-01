# [1652] JSON Schema containing array with item reference gives Typescript error: Type '"object"' is not assignable to type '"array" | undefined'.

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Libraries declared in `package.json`:
```
  "dependencies": {
    "ajv": "^8.6.0"
  },
  "devDependencies": {
    "@types/node": "^15.12.2",
    "@typescript-eslint/eslint-plugin": "^4.27.0",
    "@typescript-eslint/parser": "^4.27.0",
    "eslint": "^7.28.0",
    "eslint-config-prettier": "^8.3.0",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-prettier": "^3.4.0",
    "prettier": "^2.3.1",
    "ts-node": "^10.0.0",
    "typescript": "^4.3.2"
  }
```

**Your typescript code**
Based on the **Recursion** example here: https://json-schema.org/understanding-json-schema/structuring.html
```
/* eslint-disable no-console */
// eslint-disable-next-line node/no-missing-import
import Ajv, { JSONSchemaType } from 'ajv/dist/2020';
import draft7MetaSchema from 'ajv/dist/refs/json-schema-draft-07.json';
const ajv = new Ajv();
ajv.addMetaSchema(draft7MetaSchema);

const schema: JSONSchemaType<any> = {
  $schema: 'http://json-schema.org/draft-07/schema#',

  definitions: {
    person: {
      type: 'object',
      properties: {
        name: { type: 'string', nullable: false },
        children: {
          type: 'array',
          minItems: 0,
          items: { $ref: '#/definitions/person' },
          nullable: false
        }
      },
      required: ['name']
    }
  },

  type: 'object',

  properties: {
    person: { $ref: '#/definitions/person' }
  }
};

const validator = ajv.compile(schema);

const validData = {
  person: {
    name: 'Elizabeth',
    children: [
      {
        name: 'Charles',
        children: [
          {
            name: 'William',
            children: [{ name: 'George' }, { name: 'Charlotte' }]
          },
          {
            name: 'Harry'
          }
        ]
      }
    ]
  }
};

if (validator(validData)) {
  console.log(validData);
} else {
  console.log(validator.errors);
}
```

**Typescript compiler error messages**
```
    return new TSError(diagnosticText, diagnosticCodes);
           ^
TSError: ⨯ Unable to compile TypeScript:
src/issue.ts:13:7 - error TS2322: Type '"object"' is not assignable to type '"array" | undefined'.

13       type: 'object',
         ~~~~

    at createTSError (/Users/anjum/Documents/workspace/resilient/playground/json-schema-validator/node_modules/ts-node/src/index.ts:587:12)
    at reportTSError (/Users/anjum/Documents/workspace/resilient/playground/json-schema-validator/node_modules/ts-node/src/index.ts:591:19)
    at getOutput (/Users/anjum/Documents/workspace/resilient/playground/json-schema-validator/node_modules/ts-node/src/index.ts:921:36)
    at Object.compile (/Users/anjum/Documents/workspace/resilient/playground/json-schema-validator/node_modules/ts-node/src/index.ts:1189:32)
    at Module.m._compile (/Users/anjum/Documents/workspace/resilient/playground/json-schema-validator/node_modules/ts-node/src/index.ts:1295:42)
    at Module._extensions..js (internal/modules/cjs/loader.js:785:10)
    at Object.require.extensions.<computed> [as .ts] (/Users/anjum/Documents/workspace/resilient/playground/json-schema-validator/node_modules/ts-node/src/index.ts:1298:12)
    at Module.load (internal/modules/cjs/loader.js:641:32)
    at Function.Module._load (internal/modules/cjs/loader.js:556:12)
    at Function.Module.runMain (internal/modules/cjs/loader.js:837:10)
```

**Describe the change that should be made to address the issue?**
I do not know. However, I spotted that if I change **#/definitions/person/properties/children/nullable** to **true** then the error disappears in VSCode but the Typescript compiler still gives the same error.

**Are you going to resolve the issue?**
No because I do not know why this is happening.