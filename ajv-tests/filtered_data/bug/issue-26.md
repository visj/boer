# [26] With removeAdditional schemas can't be validated against schema different from draft 4 meta-schema

When schema is added, before it is compiled, it is validated against schema in `$schema` property (unless `validateSchema` option is false). If $schema property is not present draft 4 meta-schema is used.

If validator instance has `removeAdditional` option this schema validation may cause changing the schema (for draft 4 meta-schema it is prevented - it is compiled without this option even if this option is present).

The solution is to add `removeAdditional` option to `validate` method rather than to validator instance.
