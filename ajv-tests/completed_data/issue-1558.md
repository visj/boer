# [1558] Discrepancy in `addUsedSchema` between v6 and v8

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Migrating from 6.11 to 8.1

**Ajv options object**
{allErrors: false, addUsedSchema: true/false}

**Code**
```javascript
	const hex = {
		$id: 'hex',
		type: 'string',
		pattern: '^[A-Fa-f0-9]+$',
	}
	const combined = {
		$id: '2xhex',
		type: 'object',
		properties: {
			bar: hex,
			foo: hex,
		}
	}
	const ajv = new Ajv({allErrors: false, addUsedSchema: true})
	ajv.compile(combined)
	console.log(ajv.getSchema('2xhex') !== undefined && ajv.getSchema('hex') !== undefined) // true

	const ajv2 = new Ajv({allErrors: false, addUsedSchema: false})
	ajv2.compile(combined)
	console.log(ajv2.getSchema('2xhex') === undefined && ajv2.getSchema('hex') === undefined) // true
```

**What results did you expect?**
The above code works without issues in v6. 
The `combined` schema will be compiled, and both schemas will be either cached or not( depending on `addUsedSchema` )

However in v8.1 the compilation fails with message `Error: reference "hex" resolves to more than one schema`
Thats might be acceptable for `addUsedSchema: true`, but for `false` I would expect to compile the `combined` schema.

Is this intended behavior? I would appreciate to not fail with `addUsedSchema: false` option, similar as in v6.
(BTW: I'm aware of $ref, I just find easier to work and define JSON schemas as plain JS objects and referencing them as objects )
