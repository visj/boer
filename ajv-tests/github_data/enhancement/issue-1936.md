# [1936] add strict `additionalProperties`

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

## What version of Ajv you are you using?

8.10

## What problem do you want to solve?

We want to be able to pass data to validate() and without having to turn on any modifying functionality (`removeAdditional`) be sure that the data we're validating only has the requested properties unless specifically and explicitly asked for additional ones.

## What do you think is the correct solution to problem?

extend the available strict mode options with a `strictAdditional` that forbids additional properties unless `additionalProperties` is set to true or a schema in the schema.

```js
const ajv = new Ajv({ strictAdditional: true })
let validate = ajv.compileSchema({ properties: { a: { type: 'string' } } })
validate({ a: 'hi' })
// > true
validate({ a: 'hi', b: 'hello' })
// > false

validate = ajv.compileSchema({ properties: { a: { type: 'string' } }, additionalProperties: true })
validate({ a: 'hi' })
// > true
validate({ a: 'hi', b: 'hello' })
// > true
```

## Will you be able to implement it?

If someone can point me in the right direction, maybe.
