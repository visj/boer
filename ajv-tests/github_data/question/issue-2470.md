# [2470] Change empty string to `undefined` before validation

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.16.0

**What problem do you want to solve?**
I am using `ajv` to validate the form data using `react-hook-form`. I am using [@hookform/resolvers](https://github.com/react-hook-form/resolvers)'s [ajvResolver](https://github.com/react-hook-form/resolvers?tab=readme-ov-file#ajv).

Following is my schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "properties": {
    "string": {
      "type": "string"
    }
  },
  "required": [
    "string"
  ]
}
```
If my form data is the following (which happens when the user clears the text box), empty value is submitted.
```json
{
  "string": ""
}
```
This passes the validation and I get no error message. The expectation is to get an error message saying `string` is `required`.

This happens because JSON Schema fires the `required` validation error only if the property does not exist in the JSON.

The sending of empty strings for empty values is not particular to react-hook-form. It is the default behaviour of the HTML input element as well.

**What do you think is the correct solution to problem?**
Considering `ajv` is a popular library which is used to validate forms in popular form related libraries such as [react-hook-form](https://github.com/react-hook-form/react-hook-form) and [react-jsonschema-form](https://github.com/rjsf-team/react-jsonschema-form), it would be great if we could convert empty string to `undefined` before validation based on some flag.

**Will you be able to implement it?**
