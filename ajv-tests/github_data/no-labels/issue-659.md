# [659] Validate array items by $ref

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I'm using the latest Ajv with jsonschema draft-04.

**Ajv reader**

```javascript
const fetch = require('node-fetch')
const Ajv = require('ajv');
const draft04 = require('ajv/lib/refs/json-schema-draft-04.json')

const loadSchema = (uri) => fetch(uri).then(res => res.json());

function (url, options = {}) {
  return async function validationHook (hook) {
    const schema = await fetch(url).then(res => res.json());
    const ajv = new Ajv(Object.assign({}, {loadSchema, allErrors: true}, options));
    ajv.addMetaSchema(draft04);
    const validator = new Promise( (resolve, reject) => {
      try {
        resolve(ajv.compileAsync(schema))
      } catch (error) {
        reject(error)
      }
    })
    
    validator.catch(() => {
      throw new errors.Unprocessable('Invalid schema');
      return hook
    })

    if (hook.data) {      
      return validator.then( validate => {
        hook.params.validated = validate(hook.data)
        if (!hook.params.validated) {
          throw new errors.Unprocessable('Invalid request data', {
            errors: validate.errors
          })
        }
        return hook;
      })
    }
    return hook;
  };
};
```


**JSON Schema**
- http://localhost:3030/fhir/Patient.schema.json
```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "http://localhost:3030/fhir/Patient.schema.json",
  "allOf": [{
    "description": "Demographics and other administrative information about an individual or animal receiving care or other health-related services.",
    "properties": {
      "name": {
        "description": "A name associated with the individual.",
        "type": "array",
        "items": {
          "$ref":  "HumanName.schema.json"
        }
      }
    },
    "required": ["name"]
  }]
}
```

- http://localhost:3030/fhir/HumanName.schema.json
```json
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "http://localhost:3030/fhir/HumanName.schema.json",
  "allOf": [{
    "description": "A human's name with the ability to identify parts and usage.",
    "properties": {
      "given": {
        "description": "Given name.",
        "type": "integer"
      }
    },
    "required": ["given"]
  }]
}
```

**Expected result (It's always valid)**
*Invalid*
`curl 'http://localhost:3030/patients/' -H 'Content-Type: application/json' --data-binary '{ "name": ["It should be an integer"]}'`
*Valid*
`curl 'http://localhost:3030/patients/' -H 'Content-Type: application/json' --data-binary '{ "name": [{"given":1},{"given":2}]}'`



**JSON schema format**
I'm new to jsonschema, what I'm trying to do is to make the fhir schemas work with ajv.
There are things that I didn't quite understand. For example:
- allOf can be present even if there is only one definition.
- definitions: should be used only when there are more object definitions in a single file?
- did I made errors in the samples schema?