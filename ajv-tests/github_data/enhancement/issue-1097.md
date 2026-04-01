# [1097] Add support for filtering other than just validating

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv you are you using?** 

v6.10.2

**What problem do you want to solve?**

Sometimes, like when writing a library for managing settings, which is my use case right now, you don't actually need the entire user-provided settings object to match a schema, or otherwise you'll discard perfectly valid settings as soon as an error is found.

**What do you think is the correct solution to problem?**

The correct solution here is to _filter_, rather than validate, some data, basically this will exclude everything that doesn't match the schema and preserve everything that does.

**Will you be able to implement it?**

Probably, I've actually implemented this as a standalone library: [ajv-filter](https://github.com/fabiospampinato/ajv-filter), but it's kind of hacky, it uses undocumented variables, and I'd prefer a built-in solution written by people who actually know `ajv`.