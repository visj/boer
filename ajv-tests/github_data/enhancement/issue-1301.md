# [1301] Add support to load keywords on demand, similar to "loadSchema"

<!--
Frequently Asked Questions: https://github.com/ajv-validator/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/ajv-validator/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?**
6.12.5

**What problem do you want to solve?**
Having a lean webpack bundle, where both schemas and keywords are loaded if needed, to improve bundle load performance.

**What do you think is the correct solution to problem?**
I think having a similar option for keywords as for schemas (loadSchema) will work for this.

**Will you be able to implement it?**
I could look into it, though I did not look at the internals of AJV yet, so I don't know how much time it would take. (I currently don't have too much time to do this)