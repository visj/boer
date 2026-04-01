# [1006] Load schemas from local variable by getting the raw $ref

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**

6.7.0

**What problem do you want to solve?**

I would like to get the initial value of any `$ref` which is not found (`MissingRef`). Thus, I would be able to load additional referenced schemas from a local variable / map. Currently, the `loadSchema()` method gets called with either a resolved URI or the `$ref` itself. Therefore, I would have to apply some conditional logic to infer the actual `$ref` which was missing in the first place, by parsing the URI and so on. I would like to be able to get the initial `$ref` directly in the `loadSchema()` method so that I can check whether the initial `$ref` is already available in the local record of schemas and load it from there or otherwise load it from any upstream host. 

**What do you think is the correct solution to problem?**

I think one of the solutions is to pass a second parameter, which holds the initial missing `$ref`, to the `loadSchema()` method. 

- I can't think of any other solution which makes this possible in the package itself.
- I also tried the `ajv.addSchema()` to add any local schemas, but then the `loadSchema()` is still getting called.

**Will you be able to implement it?**

Yes, the `MissingRefError` needs to have another property. Something like `initialRef`. Eventually, the `loadSchema()` method has to be called with two parameters - the resolved URI and the `initialRef`. This could easily be done inside `loadMissingSchema()` of `async.js`
