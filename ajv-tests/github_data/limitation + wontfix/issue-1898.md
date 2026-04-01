# [1898] strict mode fails to validate number keywords when using $ref

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`8.10.0`

**Your code**

```javascript
const Ajv = require("ajv")

const schema = {
  type: 'object',
  properties: {
    foo: {
      $ref: 'foo.json/definitions/foo',
      minimum: 0,
      maximum: 100
    },
  }
};

const fooSchema = {
  $id: "defs.json",
  definitions: {
    foo: { type: "integer" }
  }
}

const ajv = new Ajv();
const validate = ajv.addSchema(fooSchema).compile(schema);

const valid = validate({ foo: 10 });
if (!valid) console.log(validate.errors);
```

**Validation result, data AFTER validation, error messages**

```
strict mode: missing type "number" for keyword "maximum" at "#/properties/foo" (strictTypes)
strict mode: missing type "number" for keyword "minimum" at "#/properties/foo" (strictTypes)
```

**What results did you expect?**

Validation should work just as if the `type` was defined in the original schema instead of the `$ref`.
![image](https://user-images.githubusercontent.com/4992870/153881806-4b350086-0e90-45ed-ad3e-89123cb52b16.png)

**Are you going to resolve the issue?**
no


