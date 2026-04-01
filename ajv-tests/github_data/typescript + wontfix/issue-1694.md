# [1694] Add types for draft-04 to ajv or a separate package

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Latest version, at the moment of writing `8.6.0`.

However, I also use `MongoDB` and the schemas that it wants should be formatted according to `draft-04`, the types for which I can only get when installing `ajv` at major version `6`.

I don't want to downgrade, though. Especially because every other part of the application relies on the latest and greatest JTD.

**Describe the change that should be made to address the issue?**
Adding the types (just the types!) for `draft-04` to the latest release would allow me to do something like:
```
import {JSONSchemaType} from "ajv/dist/types/json-schema-draft-04";
```
But crucially, it would not increase the bundle size for anyone.

**Are you going to resolve the issue?**
If this sort-of-feature-request is accepted, I can give it a shot!
