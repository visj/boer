# [1911] Incomplete documentation for validateSchema method in _KeywordDef?

I want to implement a keyword called `order` for `object` schema type. However, I can't access the `object` schema in `validateSchema` function.


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.1

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  type: 'object',
  properties: {
    name: {
      type: 'string'
    },
    age: {
      type: 'integer'
    }
  },
  order: ['name', 'age'],
  required: ['name', 'age']
}
```

**Sample data**



```json
{ name: 'test', age: 10 }
```

**Your code**

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
ajv.addKeyword({
  keyword: 'order',
  type: 'object',
  schemaType: 'array',
});
```

**Validation result, data AFTER validation, error messages**

```

```

**What results did you expect?**
I wanted to be able to use `validateSchema` to look at my `object`'s `properties` to validate my keyword schema. Specifically to verify that the strings inside `order` keyword to be the `properties` in the object.

**Are you going to resolve the issue?**
No, I can't