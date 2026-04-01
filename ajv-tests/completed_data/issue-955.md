# [955] Option removeAdditional breaks custom keywords from 6.9.0

Hi,

we upgraded our AJV from `6.5.0` to `6.9.0` and we are struggling with the validation error:

```
data: null
dataPath: ".name"
keyword: "oneOf"
message: "should match exactly one schema in oneOf"
params: {passingSchemas: [0, 1]}
passingSchemas: [0, 1]
parentSchema: {oneOf: [{$ref: "trimmedString"}, {type: "null"}]}
oneOf: [{$ref: "trimmedString"}, {type: "null"}]
schema: [{$ref: "trimmedString"}, {type: "null"}]
0: {$ref: "trimmedString"}
1: {type: "null"}
```

Our schema is:

```
export default {
	type: 'object',
	properties: {
		name: {
			oneOf: [
				{ $ref: 'trimmedString' },
				{ type: 'null' },
			],
		},
	},
	required: [ 'name' ],
};
```

`trimmedString` is keyword:
```
{
	type: 'string',
	minTrimmedLength: 1,
};
```

and `minTrimmedLength` is keyword:

```
{
	compile (minTrimmedLength) {
		return function (sample) {
			sample = sample.trim();

			return sample.length >= minTrimmedLength;
		};
	},
}
```

Input is: 

```
{
  "name": null,
}
```

In version `6.5.0` everything works fine, but in `6.9.0` is that error. Whats wrong?