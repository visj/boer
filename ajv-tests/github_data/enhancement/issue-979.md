# [979] Foolproof behaviour for addSchema

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

ajv@6.10.0

**What problem do you want to solve?**

In my project I'm using one ajv instance, adding schemas to it when it's needed. The problem is that api doesn't provide a way to know if the schema with given id is already added, and trying to add without checking leads to "schema already exists" error.

Previously I used `getSchema` to check if schema is already there, but now it fails in case it's referencing non-existent schema.

For example:

```js
const SCHEMA1 = { $id: 'test1.json', allOf: [{ $ref: 'test2.json' }] };
const SCHEMA2 = { $id: 'test2.json' };

// Add only the first schema
ajv.addSchema([SCHEMA1]);

// Now if we try to add both schemas, it fails since the first one is already there
ajv.addSchema([SCHEMA1, SCHEMA2]);

// but if we try to check that SCHEMA1 is there with avj.getSchema, it also fails since the reference leads to SCHEMA2, that is not added yet
[SCHEMA1, SCHEMA2].forEach(schema => {
	if (!ajv.getSchema(schema.$id)) {
		ajv.addSchema(schema);
	}
})
```

**What do you think is the correct solution to problem?**

Maybe an option for addSchema to override existing schema or ignore it?

**Will you be able to implement it?**

Probably :)
