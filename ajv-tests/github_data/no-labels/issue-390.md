# [390] Integers rejected

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

4.10.3 (on node 7.3.0 on win7x64sp1)

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
undefined
```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
{
  "type": "object",
  "properties": {
    "count": {
      "type": "integer"
    }
  },
}
```


**Data (please make it as small as posssible to reproduce the issue):**

```json
{
    "count": "1"
  }
```


**Your code (please use `options`, `schema` and `data` as variables):**

(As you can see, this is not a dupe of #380 because I am calling on the results of `compile()`.)

```javascript
const Ajv = require('ajv');
const ajv = new Ajv(); 

const schema = {
  "type": "object",
  "properties": {
    "count": {
      "type": "integer" // if this is "string", no error is thrown, everything works
    }
  },
};
const validate = ajv.compile(schema);

const conformsToSchema = () => (hook) => {
	const valid = validate(hook.data);
	if (!valid) {
	  throw new Error('Invalid json: ' + JSON.stringify(validate.errors, null, 2));
	}
};
```

**Validation result, data AFTER validation, error messages:**

```js
// valid===false and this gets thrown:
"Invalid json: [\n  {\n    \"keyword\": \"type\",\n    \"dataPath\": \".count\",\n    \"schemaPath\": \"#/properties/count/type\",\n    \"params\": {\n      \"type\": \"integer\"\n    },\n    \"message\": \"should be integer\"\n  }\n]"
```

**What results did you expect?**
I would expect that 1 would be treated as an integer, and pass the validation.  :)

**Are you going to resolve the issue?**
Maybe with help?  I'm completely new to ajv and was surprised when this feature did not work as expected.