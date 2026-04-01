# [1779] Input data as readable stream

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8

**What problem do you want to solve?**
I would like to validate some big JSON files (GByte) or to validate the body of http route without any size limitation. To do this, I can't load all the data in memory before validating it with ajv at the risk of saturating the memory. 
But, for now, the API of ajv has only 2 ways to validate the data : 
- by injecting a json string in the JDT parser
- by injecting a javascript object in the `validate` function  

**What do you think is the correct solution to problem?**
An example that I want to do based on the [Getting Started documentation](https://ajv.js.org/guide/getting-started.html#parsing-and-serializing-json)

```ts
import Ajv from "ajv/dist/jtd"
import { Readable } from 'stream';

const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}

const schema = {
  properties: {
    foo: { type: "int32" }
  },
  optionalProperties: {
    bar: { type: "string" }
  }
}

const parse = ajv.compileParser(schema)
const json = Readable.from('{"foo": 1, "bar": "abc"}'); // HERE JSON is a Readable stream
parseAndLog(json) // logs {foo: 1, bar: "abc"}
function parseAndLog(json: Readable | string) {
  const data = parse(json)
  if (data === undefined) {
    console.log(parse.message) // error message from the last parse call
    console.log(parse.position) // error position in string
  } else {
    console.log(data)
  }
}
```

**Will you be able to implement it?**
I don't know how to implement it in ajv and I don't know if it is possible to implement it. 
Currently, to validate my data, I use the [stream-json](https://github.com/uhop/stream-json) library but it validates only if the stream is as JSON format and not validate the data against a schema.