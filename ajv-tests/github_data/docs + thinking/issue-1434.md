# [1434] addSchema adds schema even if invalid but stops iterating over array

I just upgraded from Ajv 6.12.2 to 7.0.4. I noticed that the behavior of `addSchema` as changed. When passing an invalid schema it is still added. In version 6, it was not added. Additionally, if you pass an array, the iteration still stops after the invalid schema just like it did in version 6. I'm not sure if this is intended behavior. It seems to me that the policy should be to either add all the schemas regardless of their validity, add only the valid schemas, or stop after the first invalid schema without adding it.

Here is a minimal example that illustrates the issue:

```javascript
const Ajv = require("ajv").default;
const ajv = new Ajv();

try {
	ajv.addSchema([
		{$id: "foo", type: "number"},
		{$id: "bar", type: "corge"},
		{$id: "baz", type: "string"},
	]);
} catch (error) {
	// Will throw because "bar" is invalid.
	console.log(error.message);
}

// Will be true.
console.log(ajv.getSchema("foo") !== undefined);

try {
	// Will throw because "bar" was added but is invalid.
	console.log(ajv.getSchema("bar"));
} catch (error) {
	console.log(error.message);
}

// Will be false because iteration stopped after adding "bar".
console.log(ajv.getSchema("baz") !== undefined);
```

On my system (Node.js 10 on Ubuntu 18.04) this outputs:

```
schema is invalid: data/type should be equal to one of the allowed values, data/type should be array, data/type should match some schema in anyOf
true
type must be JSONType or JSONType[]: corge
false
```

I also think it should be documented how `addSchema` handles invalid schemas, regardless of whether this is a bug or intended behavior.