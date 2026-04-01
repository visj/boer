# [228] Use this library to parse/dereference/flatten JSON schema?

Hi! Great library! Is it possible to get a flattened JSON schema that has all of the $ref's replaced with their actual value? I'm writing a code generator based on my JSON schemas and I'm a heavy (ab)user of $ref. Right now I'm using this lib and doing this myself using the `refs` and `refVal` values of the compiled schema, but thought I'd post here in case there's a better approach.

Thanks,
Brett.
