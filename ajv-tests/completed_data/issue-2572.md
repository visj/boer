# [2572] Issue: Invalid `date-time` and `time` Formats Accepted

I am encountering issues with the JSON Schema validation for both the `date-time` and `time` formats. The validator is incorrectly accepting invalid strings that should be rejected according to the ISO 8601 standard.

### 1. Invalid `date-time` Format:

The following date-time string is being accepted as valid, but it should be considered invalid:

- Valid date-time: `2024-06-01T12:34:56Z`
- Invalid date-time (but accepted): `2024-06-01T12:34:56ZAS`

The `ZAS` suffix is not part of the correct ISO 8601 format, yet the validator allows it.

### 2. Invalid `time` Format (with Offset):

The following time string with an offset is accepted as valid, which is correct:

- Valid time with offset: `12:34:56+12:44`

However, the following string is also accepted, which should **not** be valid:

- Invalid time with extraneous characters: `12:34:56+12:44AS`

The `AS` suffix is not part of the valid ISO 8601 time format with offset, but the validator incorrectly allows it.

### Expected Behavior:
1. For the `date-time` format, only valid ISO 8601 date-time strings (e.g., `2024-06-01T12:34:56Z`) should be accepted, and any additional suffixes (like `ZAS`) should be rejected.
2. For the `time` format with offset, only valid time strings with an offset (e.g., `12:34:56+12:44`) should be accepted. Any extra characters (like `AS` in `12:34:56+12:44AS`) should cause the string to fail validation.

### Steps to Reproduce:
1. Use a JSON Schema validator that supports the `date-time` and `time` formats (e.g., AJV, Joi, etc.).
2. Provide the following strings as input:
   - `2024-06-01T12:34:56ZAS` for `date-time`.
   - `12:34:56+12:44AS` for `time` with offset.
3. Both strings should be rejected, but the validator accepts them as valid.

### Version of the Validator:
- Version: 1.4.0

### Additional Notes:
- The issue arises when extra characters are appended to valid time strings, which should be rejected.
- This behavior could be problematic when ensuring strict ISO 8601 conformance for both `date-time` and `time` fields with offsets.

Thanks for investigating this!