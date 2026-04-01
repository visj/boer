# [873] Automatically modify meta-schema with $data option

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Version 6.5.3

**Your code**

```javascript
const Ajv = require('ajv');
const ajv = new Ajv({ $data: true, allErrors: true, schemaId: 'auto' });

ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

const schema = {
  $schema:'http://json-schema.org/draft-04/schema#',
  properties: {
    min: {
      type: 'number',
      maximum: { $data: '1/max' }
    },
    max: {
      type: 'number',
      minimum: { $data: '1/min' }
    }
  }
}

const validate = ajv.compile(schema);
const data = { min: 10000, max: 1000 };

validate(data);
```
https://runkit.com/nizmox/5bc7fb1a77b25800146429c6

**Validation result, data AFTER validation, error messages**

```
Error: schema is invalid: data.properties['min'].maximum should be number, data.properties['max'].minimum should be number
```

**What results did you expect?**

Schema to compile correctly and validation fail since min > max. It seems like the $data property is incompatible with using older schemas? i.e. using v4. Is that correct? Unfortunately kind of stuck using v4 schemas as this is what `json-schema-faker` supports and we're heavily locked in with using that module.

The validation works as expected if i use the latest json schema spec (remove `addMetaSchema` and the `$schema` reference)

**Are you going to resolve the issue?**

At this point, I just want to know if the `$data` keyword is expected to work with older schemas.