# [1237] if/then/else gives imprecise error messages

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.12.0


**JSON Schema**

```json
{
    "$schema":"http://json-schema.org/draft-07/schema",
    "$id":"https://organization.com/schemas/data-schema.json",
    "type":"object",
    "required":[
        "Records"
    ],
    "properties":{
        "Records":{
            "$id":"#/properties/Records",
            "type":"object",
            "title":"The Records Schema",
            "additionalProperties":{
                "$id":"#/types/Record",
                "type":"object",
                "title":"The Record Schema",
                "oneOf":[
                    {
                        "if":{
                            "properties":{
                                "Recipients":{
                                    "type":"array",
                                    "items" : {
                                        "type" : "string"
                                    },
                                    "minItems": 1
                                }
                            },
                            "required": [
                              "Recipients"
                            ]
                        },
                        "then":{
                            "required":[
                                "DetectionMethod"
                            ]
                        },
                        "else":false
                    },
                    {
                        "if":{
                            "properties":{
                                "Data":{
                                    "type":"string"
                                }
                            },
                            "required": [
                              "Data"
                            ]
                        },
                        "then":{
                            "required":[
                                "ObjectId"
                            ]
                        },
                        "else":false
                    },
                    {
                        "if":{
                            "properties":{
                                "TimeOfClick":{
                                    "type":"string"
                                }
                            },
                            "required": [
                              "TimeOfClick"
                            ]
                        },
                        "then":{
                            "required":[
                                "UserId"
                            ]
                        },
                        "else":false
                    }
                ]
            }
        }
    }
}

```

**Sample data**

```json
{
    "Records":{
        "1":{
            "CreationTime":"2020-06-09T22:41:54",
            "DetectionMethod":"Method 1",
            "Recipients":[
            ]
        },
        "2":{
            "Data":"{somedata: data}",
            "ObjectId":"user@organization.com"
        },
        "3":{
            "UserId":"user@organization.com",
            "TimeOfClick":"2020-06-01T21:15:10"
        }
    }
}

```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/ajv-validator/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript


```


**Validation result, data AFTER validation, error messages**

```
[ { keyword: 'false schema',
    dataPath: '.Records[\'1\']',
    schemaPath:
     '#/properties/Records/additionalProperties/oneOf/0/else/false schema',
    params: {},
    message: 'boolean schema is false' },
  { keyword: 'if',
    dataPath: '.Records[\'1\']',
    schemaPath: '#/properties/Records/additionalProperties/oneOf/0/if',
    params: { failingKeyword: 'else' },
    message: 'should match "else" schema' },
  { keyword: 'false schema',
    dataPath: '.Records[\'1\']',
    schemaPath:
     '#/properties/Records/additionalProperties/oneOf/1/else/false schema',
    params: {},
    message: 'boolean schema is false' },
  { keyword: 'if',
    dataPath: '.Records[\'1\']',
    schemaPath: '#/properties/Records/additionalProperties/oneOf/1/if',
    params: { failingKeyword: 'else' },
    message: 'should match "else" schema' },
  { keyword: 'false schema',
    dataPath: '.Records[\'1\']',
    schemaPath:
     '#/properties/Records/additionalProperties/oneOf/2/else/false schema',
    params: {},
    message: 'boolean schema is false' },
  { keyword: 'if',
    dataPath: '.Records[\'1\']',
    schemaPath: '#/properties/Records/additionalProperties/oneOf/2/if',
    params: { failingKeyword: 'else' },
    message: 'should match "else" schema' },
  { keyword: 'oneOf',
    dataPath: '.Records[\'1\']',
    schemaPath: '#/properties/Records/additionalProperties/oneOf',
    params: { passingSchemas: null },
    message: 'should match exactly one schema in oneOf' } ]

```

**What results did you expect?**

Using the if/then/else validation along with the oneOf operator, I want to make sure that each record satisfies one of the scenarios. In this example, when I have zero items in the `Recipients` array, I expect an error, which I receive. But I end up receiving a lot of noisy errors, as you see. Should the if/then/else logic give me one, single well-defined error? Am I setting up my schema wrong for this validation? Any help would be appreciated!


**Are you going to resolve the issue?**
