# [1745] Support $dynamicAnchor and $recursiveAnchor in any schema location (not only root)

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.6.2, which should be the latest

**Ajv options object**
```javascript
{
    allErrors: true, 
    validateFormats: false, 
    strictSchema: false, 
    strictTypes: false
}
```

See https://github.com/OAI/OpenAPI-Specification/pull/2489 for a discussion on the options.

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->
The OpenAPI 3.1 schema defined here: https://github.com/OAI/OpenAPI-Specification/blob/main/schemas/v3.1/schema.json

I'm not proficient enough to make this a minimal reproduction example.

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

the OpenApi v3.1 webhook example here: https://github.com/OAI/OpenAPI-Specification/blob/main/examples/v3.1/webhook-example.json

**Your code**

See: https://runkit.com/essential-randomness/612d87df07ae0a00092a3492.

This simply call ajv with the given options, passes the OpenApiv3.1 schema and tries to validate the OpenApi Webhook example:

**Validation result, data AFTER validation, error messages**

```
Invalid: 
data/webhooks/newPet/post/requestBody/content/application~1json/schema must NOT have unevaluated properties, 
data/webhooks/newPet/post/requestBody must match "else" schema,
data/webhooks/newPet must match "else" schema, 
data/components/schemas/Pet must NOT have unevaluated properties, 
data/components/schemas/Pet must NOT have unevaluated properties
```

**What results did you expect?** I would expect the validation to pass.

**Are you going to resolve the issue?** 

I would like some help understanding whether the issue is in AJV or the OpenAPI specification. I was trying to add support for OpenAPIv3.1 to some JavaScript libraries that use AJV, but unfortunately this makes it impossible. 

There's many libraries that will (hopefully) want to make this switch at some point, but I couldn't find anyone who has already done it or has published an investigation of what's needed to get this working. If anyone is ever going to fix it, understanding what's going on would be the first step :)