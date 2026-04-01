# [2307] AJV will not require nested object's properties if said object is missing

When using AJV with the latest version Fastify (which embeds AJV-8x I believe) it seems that AJV will not check for missing sub properties even though they are marked as required.

```javascript
{
schema: organizationValidators.createOrganizationParams,
      validatorCompiler: ({ schema }) => ajv.compile(schema),
      schemaErrorFormatter: (errors) => {
        return new AjvPropertyRequiredError(400, errors);
      },
}
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
"body": {
    "type": "object",
    "properties": {
      "company": {
        "type": "object",
        "properties": {
          "company_name": { "type": "string" },
          "reg_number": { "type": "string" },
          "vat_number": { "type": "string" },
        },
        "required": ["company_name"],
     },
     "phone": { "type": "string" }
     "required": ["phone"]
    }
}
```

Posting the payload below

```json
{
  "phone":"123455"
}
```
 Will return no errors

However:

```json
{
  "phone":"123455",
  "company":{
     "reg_number":"A_REG_NO"
  }
}
```

Will return the appropriate error:

```
{
       instancePath: '/company',
       schemaPath: '#/properties/company/required',
       keyword: 'required',
       params: [Object],
       message: "must have required property 'company_name'"
 }
```

Is there anyway to get AJV to throw an error if the property and sub-property are missing ?
