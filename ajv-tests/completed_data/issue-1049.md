# [1049] Async validation: Cannot create property 'errors' on boolean 'true'

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.10.2

**Problem**

I'm trying to workaround the restrictions explained here: #1039. So I am trying to define an async custom keyword `typehint` instead of using `format`.

**Your code**

```javascript
async function validateEpsg(x) {
  // Something asynchronous would happen here, but removed to keep the example simple.
  if (x > 4000 && x < 10000) {
  	return true;
  }
  throw new Ajv.ValidationError([{
    message: "Invalid EPSG code specified."
  }]);
};
var validate = async function() {
  var jv = new Ajv({schemaId: 'auto', format: 'full'});
  jv.addKeyword('typehint', {
      dependencies: [
        "type"
      ],
      compile: (typehint, schema) => {
        return ('integer' === schema.type);
      },
      validate: async (schema, data) => {
        return await validateEpsg();
      },
      async: true,
      errors: true
  });
  var schema = {
      "$async": true,
      "schema": "http://json-schema.org/draft-07/schema#",
      type: "integer",
      typehint: "epsg-code"
  };
  try {
      await jv.validate(schema, 0);
      console.log("Should never happen!");
  } catch (error) {
      console.log(error);
  }
  try {
      await jv.validate(schema, 4326);
      console.log("Should happen!");
  } catch (error) {
      console.log(error);
  }
}
validate();
```


**Validation result, data AFTER validation, error messages**

When running the code above, I get the error message: `Cannot create property 'errors' on boolean 'true'`

**What results did you expect?**

First try block should log the error, second try block should print "Should happen!".
What is wrong with my code?