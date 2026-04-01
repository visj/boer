# [1514] Access root data in code generation custom keyword

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/docs/faq.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
7.2.3

**What problem do you want to solve?**
I'm trying to validate whether array items are used as object keys.

Let's say I have a schema like this
```json
{
	"keys": {
		"type": "array",
		"arrayItemsAreKeysOf": "/specialObject" // attempting to implement this custom keyword
	},
	"specialObject": {
		"type": "object"
	}
}
```

This is valid:
```json
{
	"keys": ["one", "two"],
	"specialObject": {
		"one": true,
		"two": true
	}
}
```

This is invalid:
```json
{
	"keys": ["one", "two", "three"],
	"specialObject": {
		"one": true,
		"two": true
	}
}
```

**What do you think is the correct solution to problem?**
In ajv v6 I had a custom "validate" function to check this:
```js
ajv.addKeyword('arrayItemsAreKeysOf', {
	validate(schema, data, parentSchema, dataPath, parentData, propertyName, rootData) {
		const validArrayItems = R.pipe(
			R.path(schema.split('/')),
			R.keys,
		)(rootData);
		return R.all(R.includes(R.__, validArrayItems))(data);
	},
	errors: false,
});
```
(If you're unfamiliar with Ramda, this takes the keys of a given path (`/specialObject`) from `rootData` and then checks if all items of `data` (`keys` array in examples) are present)

And it worked fine. I tried rewriting this for ajv v7+ using the code generation keyword, but I'm not sure if it's possible to access `rootData` there.


**Will you be able to implement it?**
Maybe it's already possible to do what I'm trying to achieve?