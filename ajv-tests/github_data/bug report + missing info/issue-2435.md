# [2435] ajv schema with key or id "first" already exists

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.13.0
- happening in latest version - yes
**Ajv options object**
```
{}
```
<!-- See https://ajv.js.org/options.html -->


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$id":"first",
  "type": "object",
  "properties": {
    "example": {
      "type": "string",
      "description": "example"
    }
  }
}

``` 

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "test": "Fw"
}
```

**Your code**
```
   const ajv = new Ajv()
  
    const validateJsonSchema = () => {
      try {
        if (!jsonSchema || !defaultValue) {
          showError('Please provide a JSON schema and the default value to validate')
          return
        }
        const parsedSchema = JSON.parse(jsonSchema)
        // Compile the schema using AJV
        const validate = ajv.compile(parsedSchema)

        const parsedDefaultValue = JSON.parse(defaultValue)
        const isValid = validate(parsedDefaultValue)

        if (isValid) {
          showSuccess('Value provided matches the JSON schema')
        } else {
          // Display specific error messages from AJV
          const errorMessages = validate.errors
            ?.map((err) => `${err.instancePath} ${err.message}`)
            .join(', ')
          showError(`Value provided doesn't match with schema: ${errorMessages}`)
        }
        
      } catch (error: unknown) {
        showError('Error parsing JSON schema or default value. Ensure they are valid JSON.', {
          caption: error,
        })
      }
    }
```
<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript

```

**Validation result, data AFTER validation, error messages**


![Screenshot 2024-05-14 at 12 09 40](https://github.com/ajv-validator/ajv/assets/16027152/4413d51e-169e-429f-b9e6-74cee6745876)

```
schema with key or id already exists upon trying to validate more than once and providing id with the json-schema
```

**What results did you expect?**
to be able to validate multiple times and know the actual errors
**Are you going to resolve the issue?**
