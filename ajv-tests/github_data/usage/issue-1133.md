# [1133] Missing dataPath attribute for required field

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`^6.10.2` which at this time seems to be the latest version.

**Ajv options object**

`{ allErrors: true }`

**JSON Schema**

```javascript
    {
      required: ['country'],
      properties: {
        country: {
          type: 'string',
        },
      },
      additionalProperties: false,
    }

```


**Sample data**

An empty object is being validated.

```javascript
{}
```

**Your code**

Basic schema validation. No specific code required.

**Validation result, data AFTER validation, error messages**

```
validationError {
    keyword: 'required',
    dataPath: '',
    schemaPath: '#/required',
    params: { missingProperty: 'country' },
    message: "should have required property 'country'"
}
```

**What results did you expect?**

I expect that the `dataPath` attribute in the validationError object to have the value `country`.

**Are you going to resolve the issue?**

Unknown.
