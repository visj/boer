# [385] Option serialize to be able to replace json-stable-stringify

So that objects (or booleans) are passed as keys to cache, rather than strings.

Reasons:
- WeakMap can be used as cache
- sacjs that is suggested as alternative serialises keys already using json-stable-strigify

See https://github.com/epoberezkin/ajv/issues/340#issuecomment-269140439