# [1026] Unicode support in pattern

Ajv Version: 6.10.0

Ajv does not validate the `pattern` regex using the Unicode flag `u`, which means that Unicode groups, such as `\\p{L}` will not work. I believe this can be seen and fixed here: `ajv/lib/dot/pattern.jst`.

