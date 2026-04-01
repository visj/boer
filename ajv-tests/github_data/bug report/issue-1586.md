# [1586] JTDDataType doesn't recognize the boolean type

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Using `v8.2.0`, currently the latest version

**Your code**
I can reproduce the issue with the minimal example on the [documentation](https://ajv.js.org/guide/typescript.html#utility-type-for-jtd-data-type)
```typescript
import Ajv, {JTDDataType} from "ajv/dist/jtd"
const ajv = new Ajv()

const schema = {
  properties: {
    foo: {type: "boolean"}
  },
  optionalProperties: {
    bar: {type: "string"}
  }
} as const

type MyData = JTDDataType<typeof schema>

// type inference is not supported for JTDDataType yet
const validate = ajv.compile<MyData>(schema)

const validData: any = {
  foo: true,
  bar: "abc"
}

if (validate(validData)) {
  // validData.foo is of type `unknown` instead of `boolean`
  console.log(validData.foo)
} else {
  console.log(validate.errors)
}
```

**What results did you expect?**

I expect to have the type of `foo` as `boolean`, not as `unknown`

<img width="845" alt="Screen Shot 2021-05-04 at 11 42 04" src="https://user-images.githubusercontent.com/4352637/116986584-3e190680-acce-11eb-803f-9fbd7f9c8619.png">

**Are you going to resolve the issue?**

Yes
