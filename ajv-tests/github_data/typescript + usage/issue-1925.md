# [1925] Typescript JTD examples fail with "is not assignable to type 'never'"

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Ajv v8.9.0 - this is the latest version
typescript v4.5.4

**Ajv options object**
Empty options object
<!-- See https://ajv.js.org/options.html -->

Example code below from JTD reference page, found [here](https://ajv.js.org/json-type-definition.html#jtdschematype). I only modified the code to add import and initialization of the `ajv` object. This is the complete code I am trying to compile.
```javascript
import Ajv, { JTDSchemaType } from "ajv/dist/jtd";
const ajv = new Ajv();

interface MyType {
  num: number;
  optionalStr?: string;
  nullableEnum: "v1.0" | "v1.2" | null;
  values: Record<string, number>;
}

const schema: JTDSchemaType<MyType> = {
  properties: {
    num: { type: "float64" },
    nullableEnum: { enum: ["v1.0", "v1.2"], nullable: true },
    values: { values: { type: "int32" } },
  },
  optionalProperties: {
    optionalStr: { type: "string" },
  },
};
```

**JSON Schema**
No JSON formatted schema is used. The schema is a javascript object of type `JTDSchemaType` as shown in the javascript snippet above.

**Sample data**
Sample data is not relevant because the schema will not even compile.

**Your code**
The minimal javascript shown above is the complete code I am trying to troubleshoot. Again, this is the example from the JTD reference page. All I added was the import statement and initialization of `ajv`.

**Typescript compilation messages**

```
npx tsc src/test.ts

src/test.ts:13:12 - error TS2322: Type 'string' is not assignable to type 'never'.

13     num: { type: "float64" },
              ~~~~

src/test.ts:14:28 - error TS2322: Type 'string' is not assignable to type 'never'.

14     nullableEnum: { enum: ["v1.0", "v1.2"], nullable: true },
                              ~~~~~~

src/test.ts:14:36 - error TS2322: Type 'string' is not assignable to type 'never'.

14     nullableEnum: { enum: ["v1.0", "v1.2"], nullable: true },
                                      ~~~~~~

src/test.ts:14:45 - error TS2322: Type 'boolean' is not assignable to type 'never'.

14     nullableEnum: { enum: ["v1.0", "v1.2"], nullable: true },
                                               ~~~~~~~~

src/test.ts:15:25 - error TS2322: Type 'string' is not assignable to type 'never'.

15     values: { values: { type: "int32" } },
                           ~~~~

src/test.ts:18:20 - error TS2322: Type 'string' is not assignable to type 'never'.

18     optionalStr: { type: "string" },
                      ~~~~


Found 6 errors.
```

**What results did you expect?**
I expect the example code to compile without error.

**Are you going to resolve the issue?**
I am happy to submit a documentation PR. Maybe I just failed to understand something about the examples and I could clarify the documentation. I do not understand what's going wrong so I can't resolve this myself.
