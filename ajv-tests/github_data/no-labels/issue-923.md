# [923] [Question] Behaviour of addMetaSchema

**What version of Ajv are you using?**
`5.5.2`

Forgive me if this has been already answered, but I'd like to make PR to another project that uses ajv, and I'm not sure whether what I'm thinking is right. I'm using [react-jsonschema-form](https://github.com/mozilla-services/react-jsonschema-form) that uses v5 of ajv, and they have no
t used those few lines from https://github.com/epoberezkin/ajv/tree/v5.5.2#using-version-5:

```
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));
```
I need to validate using http://json-schema.org/draft-04/schema#.
If I were to add it [here](https://github.com/mozilla-services/react-jsonschema-form/blob/master/src/validate.js), would this break anything? As I understand from https://github.com/epoberezkin/ajv/tree/v5.5.2#addmetaschemaarrayobjectobject-schema--string-key---ajv this method adds metaSchamas, and does not replace them -> but would it keep using draft-6 schema as default?

TLDR:
If I were to add `ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));` [here](https://github.com/mozilla-services/react-jsonschema-form/blob/master/src/validate.js) would it break anything?