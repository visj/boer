# [1112] default keyword ignored inside of anyOf/oneOf

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.10.2


**Ajv options object**

```javascript

new Ajv({ useDefaults: true, removeAdditional: true })

```


**JSON Schema**


```json
{
  type: 'object',
  additionalProperties: {
    oneOf: [
      {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['text', 'number']
          },
          required: {
            type: 'string',
            default: 'foo'
          }
        },
        required: ['type']
      }
    ]
  }
}

```


**Sample data**


```json
{
  foo: {
    type: 'text'
  }
}

```


**Your code**

https://runkit.com/cyberwombat/5db4c3a02daa560013eadbcb
```javascript
var Ajv = require('ajv')

ajv = new Ajv({
    useDefaults: true
});

var schema = {
  type: 'object',
  additionalProperties: {
    oneOf: [
      {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['text', 'number']
          },
          required: {
            type: 'string',
            default: 'foo'
          }
        },
        required: ['type']
      }
    ]
  }
}

var data  ={
  foo: {
    type: 'text'
  }
}

var validate = ajv.compile(schema);

console.log(validate(data));
console.log(data);
```


**What results did you expect?**

If I change `oneOf` to `allOf` then it works as expected and my result is 
```
{foo: {type: 'text', required: 'foo' }}
```

However with `oneOf` or `anyOf` the default is disregarded. It does however make use of the sun schema since it is correctly validating the `type` field. 

