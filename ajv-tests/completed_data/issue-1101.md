# [1101] Validator always returns true with Typescript 3.5.3

**The version of Ajv you are using**
6.10.2
**The environment you have the problem with**
Angular v8.2.7 in the browser, using Typescript 3.5.3

**Your code (please make it as small as possible to reproduce the issue)**
```js
import * as protokollSchema from '../../ngrx/protokoll/schema.json';
import * as Ajv from 'ajv';
import * as draft07 from 'ajv/lib/refs/json-schema-draft-07.json';

const state = JSON.parse(localStorage.getItem('someLocalStorageEntry'));
const validator = new Ajv({ allErrors: true, coerceTypes: true })
	.addMetaSchema(draft07);
const validate = validator.compile(protokollSchema);
const result = validate(state);
```

I have to enable resolveJsonModule in tsconfig.json to successfully import the schemas. They are generated using draft07-spec. Whatever I do, the call to `validate` always returns true (I can even switch schemas to some totally different file and it won't error out). Doesn't matter if I add the meta schema or not (since the default should now be draft07).

I've been using this exact setup with Angular v7 before and had no such issues. Is there anything regarding typescript module resolution that would make it not work as expected?