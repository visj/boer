# [2360] Verify is incorrectly typed for inline schemas

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
AJV: 8.12.0
TypeScript: 5.3.3

**Ajv options object**

```typescript
import Ajv from 'ajv';

const ajv = new Ajv();
```

**JSON Schema**

```json
{
	"type": "object",
	"properties": {
		"name": { "type": "string" },
		"type": { "type": "string" },
		"contents": { "type": "string" },
		"upload_size": { "type": "string" }
	},
	"required": ["name", "type"]
}
```

**Sample data**

Not Applicable

**Your code**


```typescript
import Ajv from 'ajv';

const ajv = new Ajv();

const constObj = {
	type: 'object',
	properties: {
		name: { type: 'string' },
		type: { type: 'string' },
		contents: { type: 'string' },
		upload_size: { type: 'string' }
	},
	required: ['name', 'type']
} as const;

const verifyConstObj = ajv.compile(constObj);

const verifyInsetObj = ajv.compile({
	type: 'object',
	properties: {
		name: { type: 'string' },
		type: { type: 'string' },
		contents: { type: 'string' },
		upload_size: { type: 'string' }
	},
	required: ['name', 'type']
} as const);
```

**What results did you expect?**
I expect both `verifyConstObj` and `verifyInsetObj` to resolve to the same type, as seen below.
```typescript
const verifyConstObj: ValidateFunction<{
    name: string;
    type: string;
    contents: string;
    upload_size: string;
} & {}>
```

Instead `verifyConstObj` has the proper type, and `verifyInsetObj` has the following type.
```typescript
const verifyInsetObj: ValidateFunction<{
    name: any;
    type: any;
} & {
    name: any;
} & {
    type: any;
}>
```
**Are you going to resolve the issue?**
I am able to work around the issue by providing a manually defined type to compile's generic (e.g. `ajv.compile<objType>(constObj)`. At the moment I do not plan on digging into AJV to resolve this, but I am open to looking more in the future if time allows.