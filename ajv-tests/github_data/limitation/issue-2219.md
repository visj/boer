# [2219] JSONSchemaType incorrectly parsing generic type as never

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.12.0, yes

**Ajv options object**

```{}```

<!-- See https://ajv.js.org/options.html -->

```javascript
import {JSONSchemaType} from "ajv"

const toSchema = <T extends Record<string, any>>(properties: { [key: string]: any}): JSONSchemaType<T> => {
  return {
    type: 'object',
    properties,
    required: []
  }
}
```

**JSON Schema**
NA

**Sample data**
NA

**Your code**
[TS Playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbwFIGUDyA5FBjAFgUxAEMAVATzHwF84AzKCEOAIiICsA3ZgKG+wgB2AZ3gwIOAsTgBeOAB4ScfAA8Y+AQBMhcAEr5+UDXJFRgAgOYAaOEQFkAfPYAUYBpVjB8QgFyI4AbQBrfDJfEzNzAF1fWzIqAEpfVEwJQlIKfAV7GWyEbjg4KHwYAFcoAUR8grgYDN8AcggAIzZ9GHrLKoLXCHcYTyFO6sL8AEcS4CKNX39IqqpuKiA)

```javascript
import {JSONSchemaType} from "ajv"

const toSchema = <T extends Record<string, any>>(properties: { [key: string]: any}): JSONSchemaType<T> => {
  return {
    type: 'object',
    properties,
    required: []
  }
}
```

**Validation result, data AFTER validation, error messages**

```
Type '{ type: "object"; properties: { [key: string]: any; }; required: never[]; }' is not assignable to type 'UncheckedJSONSchemaType<T, false>'.
  Object literal may only specify known properties, and 'type' does not exist in type 'never'.
```

**What results did you expect?**
I expected the type to compile without issue. It looks like the UncheckedJSONSchemaType is not correctly parsing the various if/else statements, so it ends up falling back to `never`. The error messaging here is pretty bad, but even when explicitly extending the generic from `Record` ajv fails, which is surprising.

**Are you going to resolve the issue?**
Maybe