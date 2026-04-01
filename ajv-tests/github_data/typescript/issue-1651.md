# [1651] JTD schema gives Typescript error: Type 'string' is not assignable to type 'never'

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Libraries declared in `package.json`:
```
  "dependencies": {
    "ajv": "^8.6.0"
  },
  "devDependencies": {
    "@types/node": "^15.12.2",
    "typescript": "^4.3.2"
  }
```

**Your typescript code**
This is from the examples on your site.

```
import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';
const ajv = new Ajv();

interface MyData {
  foo: number;
  bar?: string;
}

const schema: JTDSchemaType<MyData> = {
  properties: {
    foo: { type: 'int32' }
  },
  optionalProperties: {
    bar: { type: 'string' }
  }
};

// validate is a type guard for MyData - type is inferred from schema type
const validate = ajv.compile(schema);

// or, if you did not use type annotation for the schema,
// type parameter can be used to make it type guard:
// const validate = ajv.compile<MyData>(schema)

const validData = {
  foo: 1,
  bar: 'abc'
};

if (validate(validData)) {
  // validData is MyData here
  console.log(validData.foo);
} else {
  console.log(validate.errors);
}
```

**Typescript compiler error messages**
I use Visual Code and it highlights the schema **type** fields within **properties** with a red squiggly and displays this error on hover:
```
Type 'string' is not assignable to type 'never'
```

**Describe the change that should be made to address the issue?**
I do not know.

**Are you going to resolve the issue?**
No because I do not know why this is happening.
