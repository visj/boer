# [1794] OneOf validation issue when schema has all fields optionals (not required)

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

## What is going on?
AJV has [oneOf](https://ajv.js.org/json-schema.html#oneof) keyword. Validators have to validate data against all schemas to establish validity according to this keyword.

I have validation schema that has one field (field 'json') which may be one of two schemas (schema 'A' and schema 'B').
This two schemas have different fields and all of these fields are optional (not required).

```js
const schema = {
  type: 'object',
  properties: {
    json: {
      type: 'object',
      oneOf: [
        {
          title: 'A',
          type: 'object',
          properties: {
            propA: {
              type: 'number',
            }
          },
        },
        {
          title: 'B',
          type: 'object',
          properties: {
            propB: {
              type: 'number'
            }
          },
        }
      ]
    }
  },
  required: ['json']
};
```

```js
const data = {
  json: {
     propA: 123,
  },
};
```

When I'm trying to validate object with this schema where I have field 'json' with type of one of the validation schemas (schema 'A' or schema 'B') validator says `data.json should match exactly one schema in oneOf`.

You can [minimal repository](https://github.com/Piranit/ajv-oneOf-optional-issue) with all tests in `index.js`. Start script with `npm run start`.

## All minimal repo content
**Code**

```js
const Ajv = require("ajv");
const ajv = new Ajv({allErrors: true});

function test(data) {
  const valid = validate(data)
  if (valid) console.log("Valid!\n")
  else console.log(`Invalid: ${ajv.errorsText(validate.errors)}\n`)
}

const schema = {
  type: 'object',
  properties: {
    json: {
      type: 'object',
      oneOf: [
        {
          title: 'A',
          type: 'object',
          properties: {
            propA: {
              type: 'number',
            }
          }
        },
        {
          title: 'B',
          type: 'object',
          properties: {
            propB: {
              type: 'number'
            }
          },
        }
      ]
    }
  }
};

const validate = ajv.compile(schema)

const data = {
  json: {},
};

data.json.propA = 123;
console.log(`1: Should be VALID (because it fits object 'A') but it is INVALID => INCORRECT VALIDATION`);
test(data);

data.json.propA = '123';

console.log(`2: Should be INVALID (because of 'propA' must be number) but it's VALID => INCORRECT VALIDATION`);
test(data);

delete data.json.propA;
data.json.propB = 123;

console.log(`3: Should be VALID (because it fits object 'B') but it is INVALID => INCORRECT VALIDATION`);
test(data);

data.json.propB = '123';

console.log(`4: Should be INVALID (because of 'propA' must be number) but it's VALID => INCORRECT VALIDATION`);
test(data);

schema.properties.json.oneOf[0].required = ['propA'];
delete data.json.propB;

console.log(`5: Should be VALID (because it fits object 'B' -> 'propB' optional) but it is INVALID => INCORRECT VALIDATION`);
test(data);

console.log(`6: Should be VALID (because it fits object 'A' -> 'propA' number) but it is INVALID => INCORRECT VALIDATION`);
data.json.propA = 123;
test(data);

console.log(`7: Should be INVALID (because it doesn't fit object 'A' -> 'propA' must be number) but it's VALID => INCORRECT VALIDATION`);
data.json.propA = '123';
test(data);

delete data.json.propA;

console.log(`9: Should be VALID (because it fits object 'B' -> 'propB' number) but it's INVALID => INCORRECT VALIDATION`);
data.json.propB = 123;
test(data);

console.log(`10: Should be INVALID (because it doesn't fit object 'B' -> 'propB' must be number) but it's VALID => INCORRECT VALIDATION`);
data.json.propB = '123';
test(data);

delete schema.properties.json.oneOf[0].required;
schema.properties.json.oneOf[1].required = ['propB'];
console.log(`11: Should be VALID (because it fits object 'A' -> 'propA' optional) and it's VALID => CORRECT VALIDATION`);
test(data);

console.log(`12: Should be VALID (because it fits object 'A' -> 'propA' number) and it's VALID => CORRECT VALIDATION`);
data.json.propA = 123;
test(data);

console.log(`13: Should be INVALID (because it doesn't fit object 'B' -> 'propB' must be number) and it's INVALID => CORRECT VALIDATION`);
data.json.propA = '123';
test(data);

delete data.json.propA;

console.log(`14: Should be VALID (because it fits object 'B' -> 'propB' number) but it's INVALID => INCORRECT VALIDATION`);
data.json.propB = 123;
test(data);

console.log(`15: Should be INVALID (because it doesn't fit object 'B' -> 'propB' must be number) but it's VALID => INCORRECT VALIDATION`);
data.json.propB = '123';
test(data);
```

**Output**

```text
1: Should be VALID (because it fits object 'A') but it is INVALID => INCORRECT VALIDATION
Invalid: data/json must match exactly one schema in oneOf

2: Should be INVALID (because of 'propA' must be number) but it's VALID => INCORRECT VALIDATION
Valid!

3: Should be VALID (because it fits object 'B') but it is INVALID => INCORRECT VALIDATION
Invalid: data/json must match exactly one schema in oneOf

4: Should be INVALID (because of 'propA' must be number) but it's VALID => INCORRECT VALIDATION
Valid!

5: Should be VALID (because it fits object 'B' -> 'propB' optional) but it is INVALID => INCORRECT VALIDATION
Invalid: data/json must match exactly one schema in oneOf

6: Should be VALID (because it fits object 'A' -> 'propA' number) but it is INVALID => INCORRECT VALIDATION
Invalid: data/json must match exactly one schema in oneOf

7: Should be INVALID (because it doesn't fit object 'A' -> 'propA' must be number) but it's VALID => INCORRECT VALIDATION
Valid!

9: Should be VALID (because it fits object 'B' -> 'propB' number) but it's INVALID => INCORRECT VALIDATION
Invalid: data/json must match exactly one schema in oneOf

10: Should be INVALID (because it doesn't fit object 'B' -> 'propB' must be number) but it's VALID => INCORRECT VALIDATION
Valid!

11: Should be VALID (because it fits object 'A' -> 'propA' optional) and it's VALID => CORRECT VALIDATION
Valid!

12: Should be VALID (because it fits object 'A' -> 'propA' number) and it's VALID => CORRECT VALIDATION
Valid!

13: Should be INVALID (because it doesn't fit object 'B' -> 'propB' must be number) and it's INVALID => CORRECT VALIDATION
Invalid: data/json/propA must be number, data/json/propB must be number, data/json must match exactly one schema in oneOf

14: Should be VALID (because it fits object 'B' -> 'propB' number) but it's INVALID => INCORRECT VALIDATION
Invalid: data/json must match exactly one schema in oneOf

15: Should be INVALID (because it doesn't fit object 'B' -> 'propB' must be number) but it's VALID => INCORRECT VALIDATION
Valid!
```

## Default issue template

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.3, Yes.

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const Ajv = require("ajv");
const ajv = new Ajv({allErrors: true});
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
   "type":"object",
   "properties":{
      "json":{
         "type":"object",
         "oneOf":[
            {
               "title":"A",
               "type":"object",
               "properties":{
                  "propA":{
                     "type":"number"
                  }
               }
            },
            {
               "title":"B",
               "type":"object",
               "properties":{
                  "propB":{
                     "type":"number"
                  }
               }
            }
         ]
      }
   }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
   "json":{
      "fieldA":123
   }
}
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
const validate = ajv.compile(schema)
const valid = validate(data);
if (valid) console.log("Valid!\n");
else console.log(`Invalid: ${ajv.errorsText(validate.errors)}\n`)
```

**Validation result, data AFTER validation, error messages**

```
Invalid: data/json must match exactly one schema in oneOf
```

**What results did you expect?**
Should be VALID (because it fits object 'A') 

### My Environment

| Dependency          | Version  |
| ---                 | ---      |
| Operating System    | MacOS Big Sur 11.6 |
| Node.js version     | 14.17.3  |
| NPM version  | 4.4.3  |
| AJV version     | 8.6.3  |