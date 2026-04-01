# [2293] Validate function narrowing behavior not working with typescript 5.1

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Used version: 8.12.0

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const ajv = new Ajv({
  schemas: {
    'foo-schema': FooSchema
  }
})

```

**JSON Schema**


```javascript
const FooSchema: JSONSchemaType<Foo> = {
  $id: 'foo-schema',
  type: "object",
  properties: {foo: {type: "number"}},
  required: ["foo"],
  additionalProperties: false,
}

```

**Sample data**

```javascript
const foo = {
  foo: true
}

```

**Your code**

```typescript
import Ajv, { JSONSchemaType } from 'ajv';

interface Foo {
  foo: number
}

interface Bar {
  foo: boolean
}

const foo: Bar = {
  foo: true
}

const FooSchema: JSONSchemaType<Foo> = {
  $id: 'foo-schema',
  type: "object",
  properties: {foo: {type: "number"}},
  required: ["foo"],
  additionalProperties: false,
}

const ajv = new Ajv({
  schemas: {
    'foo-schema': FooSchema
  }
})



const validate = ajv.getSchema<Foo>('foo-schema')
if (!validate) {
  throw new Error()
}

if (validate(foo)) {
  console.log(foo) // [1]
} else {
  console.log(foo)
}
```

**What results did you expect?**
There is a change in the way the `validate` function narrows the type of its parameter.

Using typescript until 5.0, the type of `foo` at the bookmark [1] in the above example, matches the type passed as a generic to the `getSchema` function.

Using typescript 5.1, the type of foo at the bookmark [1] does not change and stay `Bar`

I have checked the Typescript Changelog but I have not found any lead on what might have changed

Here is a [repo](https://github.com/Baptiste-Garcin/issue-ajv-typescript) with the minimal code to reproduce. If you switch the version of typescript between 5.0 and 5.1, you will notice the change in the narrowing behaviour line 37 of the Validator.ts file.

**Are you going to resolve the issue?**
I don't think I have the skills to do this but I will check ajv source code.