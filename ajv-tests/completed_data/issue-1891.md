# [1891] can't get any context with { passContext: true } since "this" is undefined in user-defined keyword function.

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

## Issue
I can't get any context data in my custom keyword although I set [passContext](https://ajv.js.org/options.html#passcontext) and bind `this` with validate.call({ context }, values).

made a [reproduction repo](https://github.com/shuzootani/ajv-context-reproduction), in which "this" is ajv instance but still no context available.

I know this might be a type of question that I should ask on StackOverflow first [so I did but haven't got any answers yet](https://stackoverflow.com/questions/70935996/ajv-passcontext-true-this-is-undefined)
so I'd appreciate it if anyone could let me know if I'm missing something basic.
Thanks.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
```
"ajv": "^8.9.0",
"ajv-i18n": "^4.2.0",
"ajv-keywords": "^5.1.0",
```

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{ passContext: true }
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
const schema: JSONSchemaType<ViewModel> = {
  definitions: {
    Service: {
      type: 'object',
      properties: {
        timeWindow: {
          type: 'array',
          within24Hours: true,
          items: {
            type: 'object',
            properties: {
              start: {
                type: 'string',
                pattern: '[0-9]{2}:[0-9]{2}',
              },
              end: {
                type: 'string',
                pattern: '[0-9]{2}:[0-9]{2}',
              },
            },
            required: ['start', 'end'],
            additionalProperties: false,
          },
      },
      required: ['timeWindow'],
      additionalProperties: false,
    },
  },
  type: 'object',
  properties: {
    pickup: {
      $ref: '#/definitions/Service',
    },
    delivery: {
      $ref: '#/definitions/Service',
    },
  },
  anyRequired: ['pickup', 'delivery'],
  additionalProperties: false,
};
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    delivery: {
      timeWindow: [{ start: '17:00', end: '20:00' }],
    }
};
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
import Ajv from 'ajv';
import AjvKeywords from 'ajv-keywords';
import AjvLocaleJa from 'ajv-i18n/localize/ja';

export const ajv = new Ajv({ allErrors: true, $data: true, passContext: true });
AjvKeywords(ajv);

ajv.addKeyword({
  keyword: 'within24Hours',
  type: 'array',
  schema: false,
  validate: (_, data) => {
      console.log(this); => logs undefined
      return someValidationFnUsingThis(this.contextData, data)
  },
});

const validate = ajv.compile<ViewModel>(schema);
const isValid = validate.call({ contextData }, jsonFormValues);
AjvLocaleJa(validate.errors);
```

**Validation result, data AFTER validation, error messages**

I made [a small reproduction repo](https://github.com/shuzootani/ajv-context-reproduction), where "this" in ajv keyword is ajv instance but still no context available.

in keyword validate function,
console.log(this, { schema, data }) logs the following output.

```
  ajv: Ajv {
    schemas: { 'http://json-schema.org/draft-07/schema': [SchemaEnv] },
    refs: {
      'http://json-schema.org/draft-07/schema': [SchemaEnv],
      'http://json-schema.org/schema': 'http://json-schema.org/draft-07/schema',
      '': [SchemaEnv]
    },
    formats: {},
    _compilations: Set(0) {},
    _loading: {},
    _cache: Map(18) {
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv],
      [Object] => [SchemaEnv]
    },
    opts: {
      passContext: true,
      strictSchema: true,
      strictNumbers: true,
      strictTypes: 'log',
      strictTuples: 'log',
      strictRequired: false,
      code: [Object],
      loopRequired: 200,
      loopEnum: 200,
      meta: true,
      messages: true,
      inlineRefs: true,
      schemaId: '$id',
      addUsedSchema: true,
      validateSchema: true,
      validateFormats: true,
      unicodeRegExp: true,
      int32range: true,
      defaultMeta: 'http://json-schema.org/draft-07/schema'
    },
    scope: ValueScope {
      _names: [Object],
      _prefixes: [Set],
      _parent: undefined,
      _values: [Object],
      _scope: [Object],
      opts: [Object]
    },
    logger: Object [console] {
      log: [Function: log],
      warn: [Function: warn],
      dir: [Function: dir],
      time: [Function: time],
      timeEnd: [Function: timeEnd],
      timeLog: [Function: timeLog],
      trace: [Function: trace],
      assert: [Function: assert],
      clear: [Function: clear],
      count: [Function: count],
      countReset: [Function: countReset],
      group: [Function: group],
      groupEnd: [Function: groupEnd],
      table: [Function: table],
      debug: [Function: debug],
      info: [Function: info],
      dirxml: [Function: dirxml],
      error: [Function: error],
      groupCollapsed: [Function: groupCollapsed],
      Console: [Function: Console],
      profile: [Function: profile],
      profileEnd: [Function: profileEnd],
      timeStamp: [Function: timeStamp],
      context: [Function: context]
    },
    RULES: {
      types: [Object],
      rules: [Array],
      post: [Object],
      all: [Object],
      keywords: [Object]
    },
    _metaOpts: {
      passContext: true,
      strictSchema: true,
      strictNumbers: true,
      strictTypes: 'log',
      strictTuples: 'log',
      strictRequired: false,
      code: [Object],
      loopRequired: 200,
      loopEnum: 200,
      meta: true,
      messages: true,
      inlineRefs: true,
      schemaId: '$id',
      addUsedSchema: true,
      validateSchema: true,
      validateFormats: false,
      unicodeRegExp: true,
      int32range: true
    },
    errors: null
  }
} { schema: true, data: [ { start: '00:00', end: '00:00' } ] }
```

**What results did you expect?**
can get `context` data via `this` in `validate` function.

**Are you going to resolve the issue?**
I don't think I can...