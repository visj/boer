# [1864] Add an option for macro keywords to replace the original schema

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

Latest

**What problem do you want to solve?**
**What do you think is the correct solution to problem?**

While struggling to implement a keyword that would remove invalid entries from a JSON, I realized that it would be great if macro keywords had an option to replace/modify the original schema rather than extend it. That would allow for greater flexibility when implementing custom keywords – without having to resort to code generation. With such an option in place, the aforementioned keyword could have been implemented as follows:
```js
ajv.addKeyword({
  keyword: 'removeInvalid',
  replace: true,
  macro: (schema, parentSchema) => {
    const originalSchema = { ...parentSchema };
    delete originalSchema.removeInvalid;
    return { _removeInvalid: originalSchema };
  }
});

ajv.addKeyword({
  keyword: '_removeInvalid',
  modifying: true,
  compile: (schema, parentSchema) => {
    const validate = ajv.compile(schema);
    return function(data, ctx) {
      if (!validate(data)) {
        delete ctx.parentData[ctx.parentDataProperty];
      }
      return true;
    }
  }
});
```

Example schema:
```json
{
  "type": "object",
  "properties": {
    "phone": {
      "type": "string",
      "pattern": "^\\+?\\d+$",
      "removeInvalid": true
    }
  }
}
```

**Will you be able to implement it?**

I'm not that fluent in TypeScript, unfortunately.
