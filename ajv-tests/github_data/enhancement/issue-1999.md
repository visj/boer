# [1999] Resolve $ref in custom keyword

**What version of Ajv you are you using?**

8.11.0

**What problem do you want to solve?**

Use $ref in custom keywords

**What do you think is the correct solution to problem?**

JSON Schema
```
{
  "type": "object",
  "$ref": "#/$defs/schemas/Account-Ditigal-Documents",
  "validators": [
    {
      "$ref": "#/$defs/validators/tax_residence_country_vdalidator"
    }
  ],
  "$defs": {
    "validators": {
      "tax_residence_country_vdalidator": {
        "name": "",
        "func": "function tax_residence_country() {a.newAttr = {a: 1} ; return data.homeAddress.legalResidenceCountry == data.taxInfo.taxResidenceCountry }",
        "args": []
      }
  }
}
```

Code

```
ajv.addKeyword({
  keyword: "validators",
  type: "object",
  schemaType: "array",
  validate: function (schema, data, parentSchema, dataCxt) {
    console.log(schema);
    return true;
  },
  errors: false,
});
```

the  parameter`schema` is  

```
[
  {
    "$ref": "#/$defs/validators/tax_residence_country_vdalidator"
  }
]
```

expect

```
[
  {
   "name": "",
   "func": "function tax_residence_country() {a.newAttr = {a: 1} ; return data.homeAddress.legalResidenceCountry == data.taxInfo.taxResidenceCountry }",
   "args": []
  }
]
```


The parameter `schema` does not resovle $ref. Is there a way to resolve the $ref keyword? Or some internal function can do it manually.

**Will you be able to implement it?**

Sorry, I'm not a professional ts developer.