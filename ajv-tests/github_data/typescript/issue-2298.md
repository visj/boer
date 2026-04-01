# [2298] Using JTDDataType for function return values fails additionalProperties check

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.12.0 

**Your typescript code**
(using TS version 5.1.3)

```typescript
import Ajv, { JTDDataType } from "ajv/dist/jtd";

const ExampleSchema = {
  properties: {
    name: { type: "string" },
  },
} as const;

type ExampleType = JTDDataType<typeof ExampleSchema>;

const s: ExampleType = {
  name: "Foo",
  another: "Bar",
};

type ExampleFn = () => ExampleType;

const fn: ExampleFn = () => {
  return {
    name: "Foo",
    another: "Bar",
  };
};
```

**Typescript compiler error messages**
ExampleFn doesn't show any errors and approves of the 'another' key being present, while ExampleType (const s) correctly shows the following TS error:
```
Type '{ name: string; another: string; }' is not assignable to type '{ name: string; } & {}'.
  Object literal may only specify known properties, and 'another' does not exist in type '{ name: string; } & {}'.ts(2322)
```

**Describe the change that should be made to address the issue?**
I expected ExampleFn to also show the same error.

**Are you going to resolve the issue?**
Tbh I have no clue why this happens. It might be a TS internal thing I don't understand which has nothing to do with the library.
