# [1740] npm run build cause error when import import Ajv, {JTDSchemaType} from "ajv/lib/jtd"

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
^8.6.2
**Ajv options object**

```javascript
new Ajv()
```

**JSON Schema**

```json
const schema: JTDSchemaType<MyData> = {
  properties: {
    foo: {type: "int32"}
  },
  optionalProperties: {
    bar: {type: "string"}
  },
  additionalProperties: false
}
```

**Sample data**

```json
interface MyData {
  foo: number
  bar?: string
}
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
import Ajv, {JTDSchemaType} from "ajv/lib/jtd"
const ajv = new Ajv()

interface MyData {
  foo: number
  bar?: string
}

const schema: JTDSchemaType<MyData> = {
  properties: {
    foo: {type: "int32"}
  },
  optionalProperties: {
    bar: {type: "string"}
  },
  additionalProperties: false
}

// serialize will only accept data compatible with MyData
const serialize = ajv.compileSerializer(schema)

// parse will return MyData or undefined
const parse = ajv.compileParser(schema)

const matchedData = {
  foo: 1,
  bar: "abc"
}

console.log(`data: ${JSON.stringify(matchedData)} ,                        parse(serialize(data)): ${JSON.stringify(parse(serialize(matchedData)))}`)

```

**Validation result, data AFTER validation, error messages**

```
npm run build: 
node_modules/ajv/lib/compile/resolve.ts:101:3 - error TS2349: This expression is not callable.
  Type '{ default: { (schema: SchemaObject, opts: Options, cb?: Callback | undefined): void; (schema: SchemaObject, cb: Callback): void; }; }' has no call signatures.

101   traverse(schema, {allKeys: true}, (sch, jsonPtr, _, parentJsonPtr) => {
      ~~~~~~~~

  node_modules/ajv/lib/compile/resolve.ts:5:1
    5 import * as traverse from "json-schema-traverse"
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Type originates at this import. A namespace-style import cannot be called or constructed, and will cause a failure at runtime. Consider using a default import or import require here instead.

node_modules/ajv/lib/compile/resolve.ts:101:38 - error TS7006: Parameter 'sch' implicitly has an 'any' type.

101   traverse(schema, {allKeys: true}, (sch, jsonPtr, _, parentJsonPtr) => {
                                         ~~~

node_modules/ajv/lib/compile/resolve.ts:101:43 - error TS7006: Parameter 'jsonPtr' implicitly has an 'any' type.

101   traverse(schema, {allKeys: true}, (sch, jsonPtr, _, parentJsonPtr) => {
                                              ~~~~~~~

node_modules/ajv/lib/compile/resolve.ts:101:52 - error TS7006: Parameter '_' implicitly has an 'any' type.

101   traverse(schema, {allKeys: true}, (sch, jsonPtr, _, parentJsonPtr) => {
                                                       ~

node_modules/ajv/lib/compile/resolve.ts:101:55 - error TS7006: Parameter 'parentJsonPtr' implicitly has an 'any' type.

101   traverse(schema, {allKeys: true}, (sch, jsonPtr, _, parentJsonPtr) => {
                                                          ~~~~~~~~~~~~~

node_modules/ajv/lib/compile/resolve.ts:140:32 - error TS2349: This expression is not callable.
  Type '{ default: (a: any, b: any) => boolean; }' has no call signatures.

140     if (sch2 !== undefined && !equal(sch1, sch2)) throw ambiguos(ref)
                                   ~~~~~

  node_modules/ajv/lib/compile/resolve.ts:4:1
    4 import * as equal from "fast-deep-equal"
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    Type originates at this import. A namespace-style import cannot be called or constructed, and will cause a failure at runtime. Consider using a default import or import require here instead.


Found 6 errors.
```

**What results did you expect?**
build will end successfully
**Are you going to resolve the issue?**
im trying to find any solution.


BTW,
I saw that the problem can be solved if we change the import to '/dist' and not to '/lib', but my question is, why to use a compiled library already, and not use typescript source code?