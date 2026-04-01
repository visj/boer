# [2278] Allow `if`/`then`/`else` validation failures to return more meta in the error to derive what the underlying failure condition was.

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

8.10.0

**What problem do you want to solve?**

Allow `if`/`then`/`else` validation failures to return more meta in the error to derive what the underlying failure condition was.

Here's an example schema that validates if a `messageId` property exists, then `topic` should _not_ exist

```js
/* ... */
allOf: [
  {
    if: {
      anyOf: [
        {
          properties: {messageId: {}},
        },
      ],
    },
    then: {
      properties: {
        topic: {
          not: {},
        },
      },
    },
  },
]
/* ... */
```

The failure message for this error is as follows: "Bad Request: data/topic must NOT be valid, data must match "then" schema". The "data must match "then" schema" part is the problematic piece for us. We would like for ajv to return info so that we can populate something like "If messageId exists, then topic must NOT exist" (this is potentially an oversimplified error text given the complexities deriving it from the sub-schemas, but it hopefully conveys my point)

**What do you think is the correct solution to problem?**

It seems like the error string for `if`/`then`/`else` is defined [here](https://github.com/ajv-validator/ajv/blob/a27f78264ab1c3951d5131f27181d0a50e54aed0/lib/vocabularies/applicator/if.ts#L15), with meta [here](https://github.com/ajv-validator/ajv/blob/a27f78264ab1c3951d5131f27181d0a50e54aed0/lib/vocabularies/applicator/if.ts#L55-L56) that tells ajv to ignore subsequent errors. I have not dug deep enough into the code otherwise to know how best to pull out these errors, but my initial take:
1. The error string should allow for returning more info other than what `if`/`then`/`else` schema errored. This could potentially be as simple as returning the `if` sub-schema for consumption in error population logic outside of ajv, though it's possible there are other patterns elsewhere in ajv that would make more sense to follow
2. `allErrors` property should be configurable based on the top-level `allErrors` property passed to ajv in its constructor (that is, [this](https://ajv.js.org/options.html#allerrors))

**Will you be able to implement it?**

If I can get direction and sign off on an approach to use, yes! I am not sure if what I proposed would have weird side effects, so any thoughts would be appreciated!