# [352] Detect if schema has been added or overwrite a schema without errors ?

I have a case with the latest Ajv (4.9.0) where I need to add multiple schemas lazily with multiple separate calls to ajv.addSchema. Unfortunately, there seem to be no easy way to detect if a schema has been added already (regardless of compilation status). If I call addSchema twice with the same id I get an exception and from the docs the getSchema method appears to work with compiled schemas only so I can not use this method to simply check if addSchema has been called already ?

It would be nice if addSchema could take an option where it would ignore or overwrite an existing schema OR if there could be a method to check if a schema has been added already (compiled or not).
