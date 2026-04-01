# [25] removeAdditional: 'all' is not working

It seems like `removeAdditional` can be failing in many cases unless the option `validateSchema` is false.

The problem is that the schema used for schema validation (meta-schema in most cases) is compiled with this option too.
