# [1373] json-schema-secure.json fails strict type validation in v7

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

v7.0.2

**JSON Schema**

The schema in `/lib/refs/json-schema-secure.json` fails strict type validation in v7 and return the following errors when running a security check as documented at https://github.com/ajv-validator/ajv/blob/master/docs/security.md#security-risks-of-trusted-schemas:

```sh
strict mode: missing type "object" for keyword "dependencies" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#" (strictTypes)
strict mode: missing type "object" for keyword "properties" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#" (strictTypes)
strict mode: missing type "object" for keyword "required" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#/dependencies/patternProperties" (strictTypes)
strict mode: missing type "object" for keyword "properties" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#/dependencies/patternProperties" (strictTypes)
strict mode: missing type "object" for keyword "required" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#/dependencies/patternProperties/properties/propertyNames" (strictTypes)
strict mode: missing type "object" for keyword "properties" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#/dependencies/uniqueItems/if" (strictTypes)
strict mode: missing type "object" for keyword "properties" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#/dependencies/uniqueItems/if/properties/items" (strictTypes)
strict mode: missing type "object" for keyword "required" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#/dependencies/uniqueItems/then" (strictTypes)
strict mode: missing type "object" for keyword "required" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#/dependencies/pattern" (strictTypes)
strict mode: missing type "object" for keyword "required" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#/dependencies/format" (strictTypes)
strict mode: missing type "object" for keyword "additionalProperties" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#/properties/dependencies" (strictTypes)
strict mode: missing type "object" for keyword "additionalProperties" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#/properties/definitions" (strictTypes)
strict mode: missing type "object" for keyword "additionalProperties" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#/properties/patternProperties" (strictTypes)
strict mode: missing type "object" for keyword "additionalProperties" at "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/json-schema-secure.json#/properties/properties" (strictTypes)
```

This can be worked around by using `strictTypes: false`.