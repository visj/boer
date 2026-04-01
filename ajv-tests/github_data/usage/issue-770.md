# [770] If/then/else doesn't seem to work correctly

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.4.0

**Ajv options object**

**JSON Schema**
```json
{
  "id": "urn:json-schema:com.demo.Demo",
  "title": "Demo",
  "description": "A demo of if/then/else not working",
  "type": "object",
  "properties": {
    "method": {
      "enum": ["AA", "BB", "CC"]
    },
    "name": {
      "description": "Name of the product",
      "type": "string",
      "pattern": "^[a-zA-Z]{2}$"
    },
    "price": {
      "type": "string",
      "pattern": "^[0-9]{2}$"
    }
  },
  "allOf": [{
    "if": {
      "properties": {
        "method": {
          "enum": ["AA"]
        }
      }
    },
    "then": {
      "required": ["method", "name", "price"]
    },
    "else": {
      "required": ["method", "name"]
    }
  }]
}
```

**Sample data**
```
{
  "method": "AA",
  "product": "zs"
}
```

**Your code**

```javascript
  validateAgainstSchema() {
    const jsonString = this.state.value;
    const schema = require('./data/demo-schema.json');

    var Ajv = require('ajv');
    var ajv = new Ajv(); // options can be passed, e.g. {allErrors: true}
    ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-07.json'));
    var validate = ajv.compile(schema);

    let json;
    try {
      json = JSON.parse(jsonString);
    } catch (err) {
      alert('Invalid json: ' + err);
    }
    if ( json != null ) {
      var valid = validate(json);
      if (!valid) console.log(validate.errors);

      const message = (valid ? "It's good!" : "Not good: " + validate.errors);
      alert('Validation: ' + message);
    }
  }
}
```


**Validation result, data AFTER validation, error messages**

Validation: It's good!

**What results did you expect?**
expected error:   required key [price] not found
This is what the java library, everit-org/json-schema, returns.

**Are you going to resolve the issue?**
I don't have the expertise.
