# [1087] Question: getting dereferenced source schemas?

I have "Schema A" which defines some properties and "Schema B" which uses some `$ref`s to Schema A. I add these schemas to an AJV instance such that when I do `ajv.validate('schema-b', obj)` the references are resolved and the schema does the validation. That's all working just fine. Now I have a use case where I need to use the source Schema B in another AJV instance that _does not_ include Schema A. So if I do `otherAjv.addSchema( originalAjv.getSchema('schema-b').schema )` the references will not be resolvable.

So, my question is: can I force a compile of all schemas in `originalAjv` such that when I get a source schema out of it all of the references will be de-referenced?