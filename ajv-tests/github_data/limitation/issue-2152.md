# [2152] fail validation in case of undefined field


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.0

**Ajv options object**

```javascript
{}
```

**JSON Schema**
```javascript
const schema = {
  type: 'object',
  properties: {
    notUndefinedString: {
      type: 'string',
    },
  },
  required: [],
};
```

**Sample data**

```javascript
const testObject = {
  notUndefinedString: undefined,
};
```

**Code, validation result**

```javascript
const ajvValid = ajv.validate(schema, testObject);
console.log('ajv -> is valid: ', ajvValid); // true, but should be false!
```


**What results did you expect?**
I expected the validation to fail.

If I analyze an object with explicit undefined fields (even the not required ones), I want the JSON Schema validation to fail.

It works as expected using z-schema package or other online JSON schema validators, but not with ajv.

Can I have the same behavior with ajv?


working code running here: https://stackblitz.com/edit/node-ajv-vs-zschema-example?file=index.js