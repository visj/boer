# [1513] JTDDataType requires typescript 4.2

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`ajv@7.2.3` - I didn't not try previous versions.

**Your typescript code**

```ts
import { JTDDataType } from 'ajv/dist/jtd';

export const schema = {
  $id: "/scheduler:info",
  type: 'object',
  properties: {
    scheduledTransactionsCount: {
      fieldNumber: 1,
      type: 'uint32',
    },
  },
} as const;

export default schema;
export type ModuleInfoChain = JTDDataType<typeof schema>;
```

With TS 4.2.3 : `ModuleInfoChain = {
    scheduledTransactionsCount: number;
} & {}`
With TS 3.8.3 : `ModuleInfoChain = any`

**Describe the change that should be made to address the issue?**

Either improve the type def to be available in TS 3.8.3 or add in the doc that `JTDDataType` has limited support (or none actually, I barely know ajv ) prior TS 4.

**Are you going to resolve the issue?**

No ; I don't have enough knowledge with TS to offer a PR.