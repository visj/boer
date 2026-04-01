# [1603] TypeScript Example does not work

![image](https://user-images.githubusercontent.com/3061129/117855854-34257380-b28b-11eb-9c83-53f033d4bf69.png)

Module '"ajv"' has no exported member 'JSONSchemaType'.

I just took the original example from the docs: 

https://ajv.js.org/guide/typescript.html#utility-types-for-schemas

```
import Ajv, {JSONSchemaType} from "ajv"
const ajv = new Ajv()

interface MyData {
  foo: number
  bar?: string
}

const schema: JSONSchemaType<MyData> = {
  type: "object",
  properties: {
    foo: {type: "integer"},
    bar: {type: "string", nullable: "true"}
  },
  required: ["foo"],
  additionalProperties: false
}

// validate is a type guard for MyData - type is inferred from schema type
const validate = ajv.compile(schema)

// or, if you did not use type annotation for the schema,
// type parameter can be used to make it type guard:
// const validate = ajv.compile<MyData>(schema)

const validData = {
  foo: 1,
  bar: "abc"
}

if (validate(data)) {
  // data is MyData here
  console.log(data.foo)
} else {
  console.log(validate.errors)
}

```