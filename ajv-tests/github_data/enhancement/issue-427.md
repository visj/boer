# [427] Question regarding format & oneOf error validation object

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
4.11.3.


**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript 
{
   jsonPointers: true,
   verbose: true
}
```


**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
{
  "type": "object",
  "oneOf": [
    {
      "properties": {
        "foo": {
           "type": "string",
           "format": "ipv4"
        }
      },
      "required": [ "foo" ],
      "additionalProperties": false
    },
    {
      "properties": {
        "bar": {
           "type": "string",
           "format": "ipv4"
        }
      },
      "required": [ "bar" ],
      "additionalProperties": false
    }
  ]
}
```


**Data (please make it as small as possible to reproduce the issue):**

```json
{
   "foo": "10.0.0.257"
}
```


**Your code (please use `options`, `schema` and `data` as variables):**

```javascript
var options = {
   jsonPointers: true,
   verbose: true
};

var ajv = new Ajv(options);
var validate = ajv.compile(schema);
var valid = validate(data);

console.log(validate(data));
console.log(validate.errors);
```

https://runkit.com/krishnanms/58af9965e4edc300143368dd


**Validation result, data AFTER validation, error messages:**

```
[ { keyword: 'oneOf',
    dataPath: '',
    schemaPath: '#/oneOf',
    params: {},
    message: 'should match exactly one schema in oneOf',
    schema: [ [Object], [Object] ],
    parentSchema: { type: 'object', oneOf: [Object] },
    data: { foo: '10.0.0.257' } } ]
```

**What results did you expect?**
The `message` shows `'should match exactly one schema in oneOf'`, while the schema validation failed due to an invalid `format` for the ip address, shouldn't this be the keyword and cause for the validation failure rather than `oneOf`? 

**Are you going to resolve the issue?**
I am not sure I can.