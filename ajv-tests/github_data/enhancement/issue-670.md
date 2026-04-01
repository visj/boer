# [670] better error reporting for Ajv.validateSchema

https://github.com/epoberezkin/ajv/blob/02a202cfbc4bc78cca5632f6f09ba96a727302c3/lib/ajv.js#L183


# What version of Ajv you are you using?
v6.0.0


# Example
```js
let schema1 = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://example.net/chharvey/schema1.json",
  "type": "objetc" // <-- valid JSON, but not a valid schema
}
let schema2 = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://example.net/chharvey/schema2.json",
  "type": "array"
}
new Ajv().addSchema([schema1, schema2])
```


# Error
> Error: schema is invalid: data.type should be equal to one of the allowed values

Which *data.type* does the error refer to? If I’m adding lots of schema objects, how would I know which one is invalid?


# What problem do you want to solve?
Report better errors when adding an array of schemata (multiple "schemas").
This is a very simple example, but in a large program where one could be adding many schemata at a time, the error is not very helpful. It would require a human to search each and every schema file by hand to find the invalid syntax.


# What do you think is the correct solution to problem?
Please make the error more helpful by providing the filename of the invalid schema, in addition to the line number if possible. Consider using the `Error#fileName` and `Error#lineNumber` [properties (not yet standardized)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Vendor-specific_extensions).