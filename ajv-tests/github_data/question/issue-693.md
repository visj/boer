# [693] Coercion of nullable integer values does not follow same rules as coercion of nullable numbers

**What version of Ajv you are you using?**
5.5.2
**What problem do you want to solve?**
Type coercion does not take into account nullability of field in case it is of integer and not number type and converts null to 0.
**What do you think is the correct solution to problem?**
If JSON Schema states that value can be either integer or null, and original value is null, it should stay null.
**Will you be able to implement it?**
Yes.