# [1198] JSON Schema 2019-09 and JTD (v8)

# Problem

2019-09 introduced two extensions to draft-07 validation process, that are very difficult / impossible to implement in the current Ajv design, specifically:

- [x] unevaluatedKeyword that depends on annotation collection (specifically, collection of "evaluated" properties in visited and successfully validated branches), and requires validation of all dependent branches without short-circuiting.
- [x] recursiveRef that depends on dynamic ref scoping

In addition to that, it would help rethinking the definition of "keyword" in Ajv and eliminating the difference between "standard" and "custom" keyword (Ajv taxonomy) and replacing it with "applicators" and "vocabularies" of "assertions" and "annotations" (JSON Schema taxonomy).

Some other challenges that can be addressed:

- [x] simplify implementing custom applicator keywords
- [x] make validation functions serialisable more consistently than the current ajv-pack approach (PR #1332)
- [ ] ~~consider allowing schema parametrisation (#398)~~
- [ ] ~~reduce size of the validation function by refactoring error generation~~ the solution is to use the option `messages: false` together with ajv-i18n.
- [x] generate custom ajv bundles including only needed vocabularies or their subsets (#460)
- [x] JTD support can be implemented as a custom vocabulary with some extra options (#1161)

# TODO

- [x] types to support new taxonomy of keywords
- [x] ~~formalise reference resolution algorithm~~ simplify reference resolution implementation
- [x] ~~formalise annotation collection algorithm~~ only implemented to support unevaluatedProperties/Items
- [x] formalise code generation algorithm
- [x] split formats to a separate package
- [x] implement in typescript
- [x] drop draft4 support
- [x] restructure docs