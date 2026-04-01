# [437] order of oneOf subschemas changes type coercion result

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.0.3-beta.0


**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
{
  coerceTypes: true
}
```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```javascript
{
  type: "object",
  additionalProperties: false,
  properties: {
    "test": {
      oneOf: [{
        type: "number"
      },
      {
        type: "string",
        format: "email"
      }]
    }
  }
}
```


**Data (please make it as small as posssible to reproduce the issue):**

```javascript
{
  test: "10"
}

```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
const Ajv = require('ajv');

const options = {
  coerceTypes: true
};

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    "test": {
      oneOf: [{
        type: "number"
      },
      {
        type: "string",
        format: "email"
      }]
    }
  }
};

const data = {
  test: "10"
};

const ajv = new Ajv(options);

const validated = ajv.validate(schema, data);

console.log(`Validated? ${validated}`);
console.log(data);
```

**Validation result, data AFTER validation, error messages:**

```
Validated? true
{ test: '10' }
```

**What results did you expect?**
I expected the type of the `test` property to have been coerced to a number, since it was coercion to that type that allowed the validation to pass (note that if you set `coerceTypes` to `false` it fails).  If you rearrange the two items in the `oneOf` section of the schema so that the one requiring it to be a number is last, it will correctly coerce the type to a number.  The [docs](https://github.com/epoberezkin/ajv/blob/master/COERCION.md) explicitly mention `anyOf` and to my reading indicate this should work, so I'm assuming that `oneOf` should work too.  I haven't tested a variant of this with `anyOf` because I am having difficulty of reformulating the problem to use that keyword.

**Are you going to resolve the issue?**
I am willing to put some time into fixin this, but I will need a big hint as to how.  This codebase is very complex.