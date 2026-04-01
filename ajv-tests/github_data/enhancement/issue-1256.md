# [1256] Improve error messages for $data references

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

6.12.3

**What problem do you want to solve?**

I would like ajv to produce more informative error messages (and objects) for `$data` references.

Consider this example:

```js
const Ajv = require('ajv')

const ajv = new Ajv({ $data: true, allErrors: true })

const schema = {
  properties: {
    smaller: {
      type: 'number',
      minimum: 0,
      maximum: { $data: '1/larger' },
    },
    larger: {
      type: 'number',
      minimum: { $data: '1/smaller' },
      maximum: 100,
    },
  },
}

const data = {
  smaller: 99,
  larger: 1,
}

const result = ajv.validate(schema, data)

const output = {
  result,
  errors: ajv.errors,
  errorsText: ajv.errorsText(ajv.errors),
}

console.log(require('util').inspect(output, { colors: true, depth: null }))

```


The output is as follows:

```js
{
  result: false,
  errors: [
    {
      keyword: 'maximum',
      dataPath: '.smaller',
      schemaPath: '#/properties/smaller/maximum',
      params: { comparison: '<=', limit: 1, exclusive: false },
      message: 'should be <= 1'
    },
    {
      keyword: 'minimum',
      dataPath: '.larger',
      schemaPath: '#/properties/larger/minimum',
      params: { comparison: '>=', limit: 99, exclusive: false },
      message: 'should be >= 99'
    }
  ],
  errorsText: 'data.smaller should be <= 1, data.larger should be >= 99'
}

```

As only derefrenced values are displayed, for large objects it is sometimes hard to spot where the error is. The reason is that the check is supposed to validate not the exact values (`1` and `99`), but rather to the relation between properties (`smaller >= larger`). However only one of the values is reported (the referred) and only one of the property name (the referee), which makes this information incomplete and "asymmetric" (even though the comparison is a "symmetric" binary operation).

Real-world example:  in [our internal dev case](https://github.com/neherlab/covid19_scenarios/blob/f638b11e28198fb890658c5182da91fe7c34e692/schemas/PercentageRange.yml), the `begin` and `end` are the boundaries of a percentage range and there was a similar "maximum" check attached to the smaller property, but no check on the larger property. We thought (erroneously) that the ajv-reported 'should be <= 1' was related to 100%. But we store percentages in the form of 0 to 100, and 1 is therefore a correct value. Confusion was only resolved after some manual tweaking of the example data.

Additionally, we use ajv for runtime validation of user-provided data and our users might be having hard times deciphering this particular error.

**What do you think is the correct solution to problem?**

I'd suggest errors to display the names of the referred properties in addition to their values.
For example, the message could say "expected data.smaller <= data.larger, but got 99 <= 1".


**Will you be able to implement it?**
No
