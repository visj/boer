# [989] Leverage typescript definitions to specify JSON schema

**What version of Ajv you are you using?**
6.9.2

**What problem do you want to solve?**
Currently my application is written in typescript. And I have a text-editor in it, where I am using ajv to validate user input and show errors.

But for ajv to work, I am required to specify the JSON schema. But those specifications are already previously defined in the typescript interfaces. 

**What do you think is the correct solution to problem?**
TLDR; I want to re-use my typescript interfaces and ajv should be able to work without an explicit JSON schema..

**Will you be able to implement it?**
Probably using https://app.quicktype.io/ I would currently need to convert TS interfaces to JSON schema and then feed to ajv. But was wondering if that could be handled in the library itself.