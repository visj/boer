# [231] $merge/$patch pre-processing keywords for schema extension

Proposed by @fge

The reason to implement them is to allow to extend existing schemas (e.g. meta-schemas, but equally important for any large schema).

For non-recursive schemas `allOf`/`anyOf` keywords can be used, but for recursive schemas there is no extension mechanism.

https://github.com/daveclayton/json-schema-validator/wiki/v5:-merge
https://groups.google.com/forum/#!topic/json-schema/sztyQoNlnDM

@fge, syntax you propose is a bit ambiguous, it would be good to clarify and add to v5 proposals page.
