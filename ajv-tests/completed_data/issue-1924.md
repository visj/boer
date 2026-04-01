# [1924] strict mode: unknown keyword: "optionalProperties"

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.10.0

**Ajv options object**

```javascript
{
    coerceTypes: true,
    strictSchema: true,
    strictNumbers: true,
    strictTypes: 'log',
    strictTuples: 'log',
    strictRequired: false,
    loopRequired: 200,
    loopEnum: 200,
    meta: true,
    messages: true,
    inlineRefs: true,
    schemaId: '$id',
    addUsedSchema: true,
    validateSchema: true,
    validateFormats: true,
    unicodeRegExp: true,
    int32range: true,
}
```

**JSON Schema**

Not applicable

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

Not applicable

**Your code**

```javascript
const patch = schema({
  type: 'object',
  additionalProperties: false,
  optionalProperties: {
    hours: { type: 'number' },
    job: { type: 'string', objectid: true },
    date: { type: 'string', format: 'date' },
    employee: { type: 'string', objectid: true },
  },
});
```

**Validation result, data AFTER validation, error messages**

```
Error: strict mode: unknown keyword: "optionalProperties"
```

**What results did you expect?**

I'd expect optionalProperties to be allowed. It appears the search box on the ajv website is broken but I've manually searched the pages for optionalProperties and I can't see anything that I'm doing wrong. Is there a special option that needs to be enabled to turn on optionalProperties?

If I print out the AJV object after importing it, in the keywords object I do not see optionalProperties function listed. I'm on 8.10.0 and it looks like this was added in v7? 

I am using AJV that is bundled with the framework I'm using (FeathersJS) but from what I can tell besides defaulting a few options its not changing anything. 

**Are you going to resolve the issue?**
No