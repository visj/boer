# [1942] Difference between arrays custom keyword

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
v8.11.0

**What problem do you want to solve?**
**I'm not suggesting to add this keyword to Ajv**, just looking for guidance
I'm trying to implement a custom keyword that checks whether array contains the same strings, as a referenced object keys. I have read the docs, [codegen.spec](https://github.com/ajv-validator/ajv/blob/master/spec/codegen.spec.ts) (it's really good), but I'm still strugging to understand how to implement such functionality using codegen

Here's a repo: https://github.com/domnantas/ajv-playground
Here's replit: https://replit.com/github/domnantas/ajv-playground

Here's what I'm trying to do
```js
{
	items: {
		one: true,
		two: true,
	},
	itemsOrder: ["two", "one"], // valid
}
```
```js
{
	items: {
		one: true,
		two: true,
	},
	itemsOrder: ["two", "one", "three"], // invalid, "items" object does not contain "three" 
}
```
```js
{
	items: {
		one: true,
		two: true,
	},
	itemsOrder: ["two"], // invalid, "itemsOrder" is missing "one" 
}
```

**What do you think is the correct solution to problem?**
Here's how I defined a schema
```js
const schema = {
	type: "object",
	properties: {
		items: {
			type: "object",
		},
		itemsOrder: {
			type: "array",
			keysFrom: { $data: "/items" }, // custom keyword
		},
	},
};
```

And here's the unfinished `keysFrom`
```js
import Ajv, { _, KeywordCxt } from "ajv";
import { difference } from "ramda";

const ajv = new Ajv({ $data: true });
ajv.addKeyword({
	keyword: "keysFrom",
	$data: true,
	code(cxt: KeywordCxt) {
		const { data, schemaCode } = cxt;
		// I need to figure out if `data` and `schemaCode` contain the same items
		// That may be done by using difference() from Ramda
		cxt.fail$data(
			// I'm not sure what's the difference between `fail$data` and `fail`, didn't find anything in the docs
			_`console.log('codegen', ${data}, Object.keys(${schemaCode}))`
		);
	},
});
```

I need some help building the codegen function. Should I somehow pass the `difference` function to the ` _`` `? should I use `gen.forOf()` etc and somehow implement that functionality myself?

**Will you be able to implement it?**
This does not require any changes to the Ajv codebase, but I'm willing to update the docs