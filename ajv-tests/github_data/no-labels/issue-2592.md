# [2592] Strict mode rejects `x-deprecated` after draft-07 unknown keyword prefixing – clarification on cross-draft official keywords

### Summary

When using a draft-07 schema that includes the `deprecated` keyword:

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "deprecated": true
}
```

Some tooling (e.g., JSON Schema linters that strictly follow declared draft vocabularies) may classify `deprecated` as unknown in draft-07 and auto-prefix it to:

```json
"x-deprecated": true
```

However, when validating the rewritten schema with Ajv in strict mode, Ajv reports:

```
Error: strict mode: unknown keyword: "x-deprecated"
```

---

### Context

* `deprecated` was introduced in JSON Schema draft-2019-09.
* Ajv recognizes `deprecated` even when validating draft-07 schemas (cross-draft vocabulary support).
* After prefixing to `x-deprecated`, Ajv strict mode rejects the schema because `x-deprecated` is unknown.

This creates an interoperability tension:

* Strict draft-based tooling may rewrite official later-draft keywords to `x-*`.
* Ajv accepts the official keyword but rejects the prefixed version under strict mode.

---

### Question

Is Ajv’s current strict mode behavior intentional in this scenario?

Specifically:

* Should Ajv strict mode reject `x-deprecated` even when the original keyword (`deprecated`) is an official JSON Schema keyword introduced in later drafts?
* Is there a recommended way to handle cross-draft official keywords in strict mode?

I’m trying to understand whether:

1. This is expected strict-mode behavior, or
2. There is room to improve Ajv’s handling of official JSON Schema keywords used across draft boundaries.

Happy to help with a PR if this is considered an improvement.

