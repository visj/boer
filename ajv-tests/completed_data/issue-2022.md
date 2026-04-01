# [2022] Typebox number validation

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.0
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

-> see typebox object below
**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json

```

**Your code**
The code snippet below creates two different validators using typebox, one with strings, the other with strings and a number.

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```typescript
import { Static, Type }   from '@sinclair/typebox'
import addFormats from 'ajv-formats'
import Ajv        from 'ajv/dist/2019'

const ajv = addFormats(new Ajv({}), [
    'float',
    'int64',
    'int32',
    'date-time', 
    'time', 
    'date', 
    'email',  
    'hostname', 
    'ipv4', 
    'ipv6', 
    'uri', 
    'uri-reference', 
    'uuid',
    'uri-template', 
    'json-pointer', 
    'relative-json-pointer', 
    'regex'
]).addKeyword('kind')
  .addKeyword('modifier');

const ExampleType = Type.Object({
  a: Type.String(),
  b: Type.String()
});
const validator = ajv.compile(ExampleType);

const ExampleType2 = Type.Object({
  a: Type.String(),
  b: Type.String(),
  c: Type.Number()
});
const validator2 = ajv.compile(ExampleType2);

console.log(ExampleType2)
```

The package json dependencies are
```json
  "dependencies": {
    "@sinclair/typebox": "^0.24.1",
    "ajv": "^8.11.0",
    "ajv-formats": "^2.1.1"
  }
```

The vscode type hints for `validator` is correct as follows:
```
const validator: ValidateFunction<{
    a: string;
    b: string;
} & {
    [x: string]: unknown;
}>
```
However, the vscode type hints for `validator2` are not correct:
```
const validator2: ValidateFunction<{
    [x: string]: {};
}>
```



**What results did you expect?**
I would expected to see properties for `a`, `b` and `c`?

**Are you going to resolve the issue?**
Not sure   how to, the schema output of the snippet above for `ExampleType2` looks ok to me:
```
{
  type: 'object',
  properties: {
    a: { type: 'string', [Symbol(TypeBox.Kind)]: 'String' },
    b: { type: 'string', [Symbol(TypeBox.Kind)]: 'String' },
    c: { type: 'number', [Symbol(TypeBox.Kind)]: 'Number' }
  },
  required: [ 'a', 'b', 'c' ],
  [Symbol(TypeBox.Kind)]: 'Object'
}
```