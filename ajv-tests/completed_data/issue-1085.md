# [1085] pattern and patternProperties not working properly when using backslashes

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.4.0 - Not sure about using latest.


**JSON Schema**

```javascript
             {
                 "type": "object",
                 "properties": {
                   "foo": {
                     "type": "string",
                     "pattern": '^[^\\"]+$',
                   }
                 },
             };

```

**What results did you expect?**
`{ "foo": "an invalid\\ string" }` should error (It does not)

`{ "foo": "an invalid\" string" }` should error (It does)
