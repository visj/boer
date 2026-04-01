# [1039] Custom formats for more data types

**What version of Ajv you are you using?**

6.10.0

**What problem do you want to solve?**

Custom format-based validation for integers, objects, arrays.

**What do you think is the correct solution to problem?**

Currently, the[ documentation says addFormat only works for schemas that use the data types string and number](https://github.com/epoberezkin/ajv#addformatstring-name-stringregexpfunctionobject-format---ajv). It would be helpful to also allow that for arrays, objects and integers. Maybe also schemas that don't have a data type set at all.

For example, I have a schema for EPSG codes:
```json
{
	"type": "integer",
	"format": "epsg-code"
}
```

I'd like to use the format to check the integer data against a EPSG code database. I don't see a reason why the data types should be limited.

```js
var ajvOptions = {
	format: 'full',
	formats: {
		'epsg-code': {type: 'integer', async: true, validate: this.validateEpsgCode.bind(this)}, // doesn' work
		'epsg-code-num': {type: 'number', async: true, validate: this.validateEpsgCodeNumeric.bind(this)} // works, but is counter-intuitive to tell users that they need to use number for integers when there's an integer data type in JSON schema
	}
};
```

I have use cases for arrays and objects, too.

**Will you be able to implement it?**

At least, I could make it work for me by changing the declaration of RULES in lib/compile/rules.js to
```js
  var RULES = [
    { type: 'number',
      rules: [ { 'maximum': ['exclusiveMaximum'] },
               { 'minimum': ['exclusiveMinimum'] }, 'multipleOf', 'format' ] },
    { type: 'integer',
      rules: [ 'format' ] },
    { type: 'string',
      rules: [ 'maxLength', 'minLength', 'pattern', 'format' ] },
    { type: 'array',
      rules: [ 'maxItems', 'minItems', 'items', 'contains', 'uniqueItems', 'format' ] },
    { type: 'object',
      rules: [ 'maxProperties', 'minProperties', 'required', 'dependencies', 'propertyNames', 'format',
               { 'properties': ['additionalProperties', 'patternProperties' ] } ] },
    { rules: [ '$ref', 'const', 'enum', 'not', 'anyOf', 'oneOf', 'allOf', 'if', 'format' ] }
  ];
```
Unfortunately, I am not sure what side effects this may cause and whether it's the best way to do it.

**Edit:** After a discussion with some JSON Schema folks, it seems format is meant to be used also for non-string data types (see https://github.com/json-schema-org/json-schema-spec/issues/759). So this issue seems valid, but they also pointed me towards custom keywords. Seems to be reasonable and I'll try them out, too.