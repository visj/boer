# [1877] Type '{}' is not assignable to type 'never' when constructing a JTDSchema involving "any"

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.9.0

**Your typescript code**
```typescript
import {JTDSchemaType} from "ajv/dist/jtd";

type Foo = {
	bar: any[]
}

const schema: JTDSchemaType<Foo> = {
	properties: {
		bar: {
			elements: {}
		}
	}
};
```

**Typescript compiler error messages**

```
index.ts:10:4 - error TS2322: Type '{}' is not assignable to type 'never'.

10    elements: {}
      ~~~~~~~~


Found 1 error.
```

**Describe the change that should be made to address the issue?**
Perhaps I'm describing the schema incorrectly, but I'm looking to validate that an array exists at that property, but not what the type of the array is. This also seems to occur when I instead use `any` instead of `any[]`. For reference, I'm looking at [this portion of the documentation](https://ajv.js.org/json-type-definition.html#empty-form).