# [892] How can I use multiple types with refs? | Question

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**



**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

Default from [fastify](https://www.fastify.io/)

**User JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```js
{
	$id: 'user',
	type: 'object',
	properties: {
		_id: { type: 'string' },
		email: {
			type: 'string',
			format: 'email',
		},
		firstName: { type: 'string' },
		lastName: { type: 'string' },
		avatar: {
			anyOf: [
				'photo#',
				{ type: 'string' }
			]
		},
	},
},
```
**Photo JSON Schema**
```js
{
	$id: 'photo',
	type: 'object',
	properties: {
		_id: { type: 'string' },
		type: { type: 'string' },
		src: { type: 'string' },
		description: { type: 'string' },
	},
},
```
**Sample data with avatar as string**

<!-- Please make it as small as posssible to reproduce the issue -->

```js
{
  _id: '5c0071ce836313265b815dfc',
  email: 'test@test.com',
  firstName: 'testFirstName',
  lastName: 'testLastName',
  avatar: 'someId',
}

```

**Sample data with avatar as object**

<!-- Please make it as small as posssible to reproduce the issue -->

```js
{
  _id: '5c0071ce836313265b815dfc',
  email: 'test@test.com',
  firstName: 'testFirstName',
  lastName: 'testLastName',
  avatar: {
    src: 'some source'
    type: 'image',
    description: 'some description'
  },
}

```
**Validation result, data AFTER validation, error messages**

```
{
   _id: '5c007471c8d84b3dcc49b629',
  email: 'test@test.com',
  firstName: 'testFirstName',
  lastName: 'testLastName',
  avatar: null,
}
```

**What results did you expect?**

I expect that my schema will validated as well, when I send a string he should return string, when I send object he should return object with validated properties

**Are you going to resolve the issue?**
Many various with anyOf, oneOf, allOf and type: ['string', 'object']