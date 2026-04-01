# [1675] add support for `type: "symbol"`

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**

6.12.6 and 8.6.0

**What problem do you want to solve?**

I want to allow passing Symbols as values in the webpack configuration.

**What do you think is the correct solution to problem?**

``` json
{
  "type": "symbol"
}
```

For symbols in JS `typeof Symbol() === "symbol"`, so I think that makes most sense here. But Symbols are not part of JSON, so maybe it might be better as ajv plugin?

**Will you be able to implement it?**

If you point me to the file where `type` is implemented, I think so