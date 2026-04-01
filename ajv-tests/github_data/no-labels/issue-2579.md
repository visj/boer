# [2579] oneOf incorrectly tracks evaluated properties for unevaluatedProperties (Draft 2020-12)

🔴 Summary

When using oneOf together with unevaluatedProperties (Draft 2020-12), Ajv only merges evaluation information from the subschema that passes validation.
Properties (or items) that are processed by oneOf branches which fail validation are not recorded as evaluated, which can cause unevaluatedProperties: false to incorrectly reject valid instances.

📜 Spec reference

JSON Schema Draft 2020-12, §6.5.3.2.2 (Evaluation of instance locations):

Instance locations are considered evaluated when they are processed by an applicable keyword, regardless of whether validation of that keyword succeeds or fails.

Under this model, evaluation is tied to processing, not to overall subschema validity in oneOf.

📍 Location in code
lib/vocabularies/applicator/oneOf.ts


Specifically, cxt.mergeEvaluated(...) is currently called only when schValid === true, so evaluated locations from failing oneOf branches are dropped.

🧪 Minimal reproduction

Schema (Draft 2020-12):

{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "oneOf": [
    {
      "properties": { "a": { "type": "string" } },
      "required": ["a", "x"]
    },
    {
      "properties": { "b": { "type": "number" } },
      "required": ["b"]
    }
  ],
  "unevaluatedProperties": false
}


Instance:

{ "a": "test", "b": 42 }

❌ Current behavior

Subschema 0 evaluates property "a" but fails overall (missing "x").

Subschema 1 evaluates property "b" and passes.

Ajv merges evaluated properties only from the passing subschema.

Property "a" is treated as unevaluated, causing a validation failure.

✅ Expected behavior

Both "a" and "b" should be considered evaluated, since they were processed by applicable keywords in oneOf subschemas.
The instance should validate successfully, and only truly unevaluated properties (e.g. "c") should be rejected.

💥 Impact

Causes false negatives when combining oneOf with unevaluatedProperties.

Affects common real-world patterns (union-like object schemas in APIs).

Violates Draft 2020-12 evaluation semantics.

🔧 Suggested fix (high-level)

Merge evaluated properties/items from all evaluated oneOf subschemas, regardless of validation outcome, while keeping the existing oneOf requirement that exactly one subschema must pass.
Since mergeEvaluated is already gated by opts.unevaluated, this should not affect drafts or configurations where unevaluated tracking is disabled.

📝 Notes

I have a local patch and regression tests that address this issue and am happy to open a PR if the approach above aligns with Ajv’s expectations.