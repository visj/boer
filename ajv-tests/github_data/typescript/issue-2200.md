# [2200] Using `SomeJTDSchemaType ` as a class property type fails TS compilation

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html

This template is for issues about missing or incorrect type definition and other typescript-related issues.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`8.12.0`, which is the latest version at the moment.

It might also be worth noting that I've tried the latest TypeScript compiler (`4.9.4`) and the previous minor version (`4.8.4`)

**Your typescript code**

<!--
Please make it as small as possible to reproduce the issue
-->

```typescript
import Ajv from 'ajv'
import {AsyncSchema, AsyncValidateFunction} from 'ajv/dist/types'
import {JTDDataType, SomeJTDSchemaType} from 'ajv/dist/types/jtd-schema'

const ajv = new Ajv()

export abstract class MyExampleClass {
  protected abstract schema: SomeJTDSchemaType
  private _validate?: Promise<AsyncValidateFunction<JTDDataType<typeof this.schema>>>

  private get validate(): Promise<AsyncValidateFunction<JTDDataType<typeof this.schema>>> {
    this._validate ??= ajv.compileAsync<JTDDataType<typeof this.schema>>({...this.schema, $async: true} as AsyncSchema)

    return this._validate
  }
}
```

**Typescript compiler error messages**

```
error TS2589: Type instantiation is excessively deep and possibly infinite.
```

**Describe the change that should be made to address the issue?**
I am unsure. I've spent the better half of today trying to figure out what the issue is here and have not made much progress.

**Are you going to resolve the issue?**
I have not been able to.

________________

Hi all 👋

I'm new to ajv so it's possible this is user error. I'm trying to add a generic JTD schema property to an abstract class, and I'm attempting to use the `SomeJTDSchemaType` and `AsyncValidateFunction` types to do so. This borks the TypeScript compiler, I'm assuming due to the recursive nature of `SomeJTDSchemaType`. Any ideas?