# [1920] if/then within oneOf seems to ignore required const

Hi!

The code below is failing, and it seems to me it is failing because the validation matches multiple blocks inside of `oneOf` (causing an error). I believe the required `const` should discriminate such that only one of the blocks matches, not several.

Working off the information here: http://json-schema.org/understanding-json-schema/reference/generic.html#constant-values

Not sure why there are multiple `passingSchemas`.  Hope I'm not just missing something obvious :)

Thanks for the great library!

## dependencies

Node 17.6.0

`package.json` is of `"type": "module"`

```json
dependencies: {
  "ajv": "^8.10.0",
  "ajv-errors": "^3.0.0",
  "ajv-formats": "^2.1.1"
}
```

## setup

```javascript
import Ajv from 'ajv';
import addErrors from 'ajv-errors';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
    allErrors: true
});

addErrors(ajv);
addFormats(ajv);
```
## schema

```
{
    oneOf: [{
        if: { type: 'object', properties: { factor: { const: 'a' } }, required: ['factor'] },
        then: {
            type: 'object'
        }
    }, {
        if: { type: 'object', properties: { factor: { const: 'b' } }, required: ['factor'] },
        then: {
            type: 'object'
        }
    }, {
        if: { type: 'object', properties: { factor: { const: 'c' } }, required: ['factor'] },
        then: {
            type: 'object'
        }
    }]
}
```

## sample

```javascript
const validator = ajv.compile(schema);

const valid = validator({
    factor: 'b'
});

console.log(valid);
console.log(JSON.stringify(validator.errors, undefined, 2));
```

## full code

```javascript
import Ajv from 'ajv';
import addErrors from 'ajv-errors';
import addFormats from 'ajv-formats';

const ajv = new Ajv({
    allErrors: true
});

addErrors(ajv);
addFormats(ajv);

const schema = {
    oneOf: [{
        if: { type: 'object', properties: { factor: { const: 'a' } }, required: ['factor'] },
        then: {
            type: 'object'
        }
    }, {
        if: { type: 'object', properties: { factor: { const: 'b' } }, required: ['factor'] },
        then: {
            type: 'object'
        }
    }, {
        if: { type: 'object', properties: { factor: { const: 'c' } }, required: ['factor'] },
        then: {
            type: 'object'
        }
    }]
}

const validator = ajv.compile(schema);

const valid = validator({
    factor: 'b'
});

console.log(valid);
console.log(JSON.stringify(validator.errors, undefined, 2));

```

# result

```
false
[
  {
    "instancePath": "",
    "schemaPath": "#/oneOf",
    "keyword": "oneOf",
    "params": {
      "passingSchemas": [
        0,
        1
      ]
    },
    "message": "must match exactly one schema in oneOf"
  }
]
```

**What results did you expect?**
```
I expected the code to only match one of the blocks. 

true
null
```

## resolution

Switching `oneOf` to `anyOf` works, but isn't exactly what I need -- I want to guarantee only one match (`oneOf`).
