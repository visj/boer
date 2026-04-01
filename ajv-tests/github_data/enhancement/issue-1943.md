# [1943] Display additionalProperty in error.message

**What version of Ajv you are you using?**
8.11.0

**What problem do you want to solve?**
Display informative error message with instancePath+message

**What do you think is the correct solution to problem?**
(Almost) Every error can be displayed with instancePath and message. But from additionalProperty error message missing the affected property. I can read it only from params. I would like to inform the user about additional property not only the error category. Like when required property missing or value must be greater then...

**Will you be able to implement it?**
I think yes, need implement here: https://github.com/ajv-validator/ajv/blob/master/lib/vocabularies/applicator/additionalProperties.ts#L21 similar to https://github.com/ajv-validator/ajv/blob/master/lib/vocabularies/validation/required.ts#L20 . And of course I need to looking for 2 other usage of string "must NOT have additional properties".

Should I make a PR?