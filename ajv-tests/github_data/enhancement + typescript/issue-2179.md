# [2179] Enum type allows no overlap with typescript type



**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.19.2

IMO this is not fine:
```javascript
import Ajv2020 from 'ajv/dist/2020';

type AOrBType = 'a' | 'b';
const aOrBSchema: JSONSchemaType<AOrBType> = {
  type: 'string',
  enum: ['FOO'],
};
```
The validator never produces a value that is truly `AOrBType`. However, there's no error with this definition. I think there should be.
