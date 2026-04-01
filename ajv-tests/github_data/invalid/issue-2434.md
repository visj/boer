# [2434] ajv.compileParser does not exist on type Ajv

Hi ,

I am trying to use ajv.compileParser with JSONSchemaType. I am unable to find the **ajv.compileParser**. 

ajv version - 8.13.0

I am using the basic example from the docs.

```
import {Ajv, JSONSchemaType,} from "ajv"

const ajv = new Ajv();

interface MyData {
    foo: number
    bar?: string
}

const schema: JSONSchemaType<MyData> = {
    type: "object",
    properties: {
        foo: {type: "integer"},
        bar: {type: "string", nullable: true}
    },
    required: ["foo"],
    additionalProperties: true
}

// validate is a type guard for MyData - type is inferred from schema type
const validate = ajv.compile(schema)

const data = {
    foo: 1,
    bar: "abc",
    test: 12,
}

// parse will return MyData or undefined
const parse = ajv.compileParser(schema) // error 

```

Error - 

`Property  compileParser  does not exist on type  Ajv`



