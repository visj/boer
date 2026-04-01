# [69] version 2.0

The version should address inconsistencies with how dataPaths are reported in errors and also expose in properties of error objects information that is currently only available in error messages (without the need to use i18n option).
- [x] `additionalProperties` should have dataPath at the parent level, not additional property level (revert the change in #11). - keep the current behaviour with option `errorDataPath` equal to `"property"`.
- [x] possibly, report all additional properties in a single error with the array of properties available in error. To make it more backward compatible, the old (current) behaviour can be still available with some option. WONTFIX
- [x] `required` should have dataPath at the parent level, not missing property level (revert the changes in #18 and #55). - keep the current behaviour with option `errorDataPath` equal to `"property"`
- [x] possibly, report all missing properties in a single error with the array of properties available in error. WONTFIX
- [x] add additional property to error object with missing and additional properties and other parameters that are only available with i18n option now. Probably it can still be called `params` as it is now. EDIT: with `params` option. EDIT: `params` are available without any option, option `i18n` is deprecated.
- [x] address the issue with `dependencies` (#68). There should be only missing dependency (for property dependencies) in the error, not all required. In `{allErrors: true}` mode there should be a separate error for each missing dependency (this part is #73). EDIT with option `errorDataPath` equal to `"property"` dataPath should point to the property.
- [x] document properties of error objects for all validation keywords
- [x] update the messages in [ajv-i18n](https://github.com/epoberezkin/ajv-i18n) accordingly
- [x] EDIT: custom keywords via user supplied functions.
- [x] macro custom keywords
- [x] inlined custom keywords
- [x] add old parameters to error objects with `params14` option WONTFIX until requested, probably nobody used params yet
- [x] check/extend errors in inline custom keywords
- [x] tests for custom keywords creating errors
- [x] keywords `constant` and `contains` from JSON-schema v5 proposals
