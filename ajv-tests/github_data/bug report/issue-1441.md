# [1441] Change to KEYWORD_NAME regex to add colon actually allows many characters

https://github.com/ajv-validator/ajv/pull/1425 was intended to add ':' to the list of characters allowed in keyword names. Because of the placement of the colon in the regex, after a hyphen, it actually has the effect of allowing all characters from '$' to ':', which includes things like comma, single quote and asterisk.

The fix would be to change the regex at https://github.com/ajv-validator/ajv/blob/master/lib/core.ts#L745 from

`^[a-z_$][a-z0-9_$-:]*$`

to

`^[a-z_$][a-z0-9_$:-]*$`

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
7.1.0

**Ajv options object**

{}

**JSON Schema**


**Sample data**


**Your code**


**Validation result, data AFTER validation, error messages**

**What results did you expect?**

**Are you going to resolve the issue?**

Yes.