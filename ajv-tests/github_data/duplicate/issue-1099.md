# [1099] Include additionalProperty name in error message

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

`^6.10.0`

**What problem do you want to solve?**

```js
const ajv = new Ajv()
const validate = ajv.compile({
  type: 'object',
  additionalProperties: false,
  properties: {}
})
if (!validate({ foo: 0 })) {
  console.log(validate.errors[0].message)
}
```

I get: `should NOT have additional properties`.

**What do you think is the correct solution to problem?**

It should be nice to have the name of the additional property, like: `should NOT have additional property 'foo'`.

Is it possible? Did I miss something?

Is there a reason that's not the case?

**Will you be able to implement it?**

Maybe with some help :slightly_smiling_face: 