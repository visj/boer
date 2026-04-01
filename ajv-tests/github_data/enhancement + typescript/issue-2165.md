# [2165] Typescript parser/serializer type is unknown when using JTD definitions

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.2 (latest version as of issue creation)

Using Typescript 4.8.4

**Ajv options object**

Using defaults

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

Using refs with JTD does not produce a type safe object when using `compileParser` or `compileSerializer`. The resulting object is always of type `unknown` in Typescript (this also does not work with recursive refs)

```javascript
// using the schema provided in the documentation https://ajv.js.org/json-type-definition.html#ref-schemas
const schema: JTDSchemaType<{val: number}, {num: number}> = {
  definitions: {
    num: {type: "float64"},
  },
  properties: {
    val: {ref: "num"},
  },
}

const ajv = new Ajv()
const parse = ajv.compileParser(schema)

const result = parse(data) // type should be {val: number}, but is unknown
```

**What results did you expect?**
`compileParser` and `compileSerializer` should produce type-safe results.

**Are you going to resolve the issue?**
Unsure how to resolve the issue.