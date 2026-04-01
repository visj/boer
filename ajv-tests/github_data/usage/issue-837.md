# [837] additionalProperties and allOf together : how ?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

> 6.5.2, yes

**Ajv options object**

```
{
allErrors: true,
schemaId: 'auto',
removeAdditional: true,
format: 'full'
}
```

**JSON Schema**

```
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "http://hl7.org/fhir/json-schema/Period",
  "$ref": "#/definitions/Period",
  "description": "see http://hl7.org/fhir/json.html#schema for information about the FHIR Json Schemas",
  "definitions": {
    "Period": {
      "allOf": [
        {
          "$ref": "Element#/definitions/Element"
        },
        {
          "additionalProperties": false,
          "properties": {
            "start": {
              "type": "string",
              "pattern": "-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?"
            },
            "end": {
              "type": "string",
              "pattern": "-?[0-9]{4}(-(0[1-9]|1[0-2])(-(0[0-9]|[1-2][0-9]|3[0-1])(T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](\\.[0-9]+)?(Z|(\\+|-)((0[0-9]|1[0-3]):[0-5][0-9]|14:00)))?)?)?"
            },
          }
        }
      ]
    }
  }
}
```


**Sample data**

```
{
    "id": "1",
    "start": "2000",
    "end": "2001",
    "foo": "qwqwqwqwqwq"
}
```

**What results did you expect?**

> 
    Start and End must be valid, the id should have made it too because it's defined in another schema named Element and referenced in the allOf but foo should be failing

**Are you going to resolve the issue?**

> I tried so hard, but i could only have either start and end or id but not all three of them. The schema for Element is basically the same as Period, it just contains an id, and the same allOf