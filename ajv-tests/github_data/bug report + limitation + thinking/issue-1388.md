# [1388] removeAdditional is not consistent with documentation. 

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

7.0.3

**Ajv options object**


```javascript
{ removeAdditional: true }
```

**JSON Schema**


```javascript
{
  type: "object",
  oneOf: [
    {
      properties: {
        foo: { type: "string" }
      },
      required: ["foo"],
      additionalProperties: false
    },
    {
      properties: {
        bar: { type: "integer" }
      },
      required: ["bar"],
      additionalProperties: false
    }
  ]
}
```

**Sample data**

```javascript
{ bar: 1 }
```

**Your code**

Please see this codesanbox. Change ajv version from 7 to 6 to compare. 

https://codesandbox.io/s/ajv6-oneof-removeadditional-sf9yt?file=/src/App.tsx


**Validation result, data AFTER validation, error messages**

The data is valid.

**What results did you expect?**

According to the doc "With the option `removeAdditional: true` the validation will pass for the object `{ "foo": "abc"}` but will fail for the object `{"bar": 1}`. It happens because while the first subschema in `oneOf` is validated, the property `bar` is removed because it is an additional property according to the standard (because it is not included in `properties` keyword in the same schema)." 

This was true in ajv 6 but  not in ajv 7. 

As far as I'm concerned, I believe that that the example in the doc is pretty odd and that the current behavior is correct. 

**Are you going to resolve the issue?**

No, I am working on the removeUnevaluated property and I believe that removeAdditional has many counterintuitive elements and should be deprecated.