# [1208] Behavoiur of allOf in case of nested objects.

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
"ajv": "^6.12.2",
"ajv-keywords": "^3.4.1"


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
schemaId: 'auto',
allErrors: true,
jsonPointers: true,
verbose: true,
$data: true
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "type": "object",
    "properties": {
        "aciveIndex": {
            "type": "number"
        },
        "basicInfo": {
            "type": "object",
            "properties": {
                "firstName": {
                    "type": "string"
                },
                "lastName": {
                    "type": "string"
                },
                "gender": {
                    "type": "string",
                    "enum": ["Male", "Female", "Other"]
                },
                "yearOfBirth": {
                    "type": "number"
                }
            },
            "required": [
                "firstName",
                "lastName",
                "gender",
                "yearOfBirth"
            ]
        },
        "educationInfo": {
            "type": "object",
            "properties": {
                "testName": {
                    "type": "string",
                    "enum": [
                        "GRE",
                        "GMAT",
                        "None"
                    ]
                },
                "testScore": {
                    "type": "number",
                    "minimum": 0,
                    "allOf":[{
                        "if": {
                            "const": "GRE"         
                        },
                        "then":{
                            "maximum": 350
                        }
                    },{
                        "if": {
                            "const": "GMAT"           
                        },
                        "then":{
                            "maximum": 800
                        }
                    }]
                },
                "yearOfExamination": {
                    "type": "number",
                    "minimum": 2015,
                    "maximum": 2021
                },
                "graduationInstitute": {
                    "type": "string"
                },
                "graduationFieldOfStudy": {
                    "type": "string"
                },
                "graduationGpa": {
                    "type": "number",
                    "miximum": 100
                },
                "graduationYearOfCompletion": {
                    "type": "number",
                    "maximum": 2021
                }
            },
            "allOf": [
                {
                    "required": [
                        "testName",
                        "graduationInstitute",
                        "graduationFieldOfStudy",
                        "graduationYearOfCompletion"
                    ]
                },
                {
                    "if": {
                        "properties":{
                            "basicInfo": {
                                "properties":{
                                    "yearOfBirth": {
                                        "maximum": 2017
                                    }
                                }
                            }
                        }
                    },
                    "then": {
                        "required": ["graduationGpa"]
                    }
                },
                {
                    "if": {
                        "properties":{
                            "testName": {
                                "const": "None"
                            }
                        }
                    },
                    "then":{
                        "required": []
                    },
                    "else": {
                        "required": [
                            "testScore",
                            "yearOfExamination"
                        ]
                    }
                }
            ]
        },
        "workInfo": {}
    }
}
```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```json
{
    "basicInfo": {
        "firstName": "shiv",
        "lastName": "Garg",
        "gender": "Male",
        "yearOfBirth": 1994
    },  
    "educationInfo": {
        "testName": "GRE",
        "graduationInstitute": "abc",
        "graduationFieldOfStudy": "abc",
        "graduationYearOfCompletion": 2016,
        "testScore": 900,
        "yearOfExamination": 2019
    }
}
```

For the given schema mentioned here. I need to do two things. 
1. If the `basicInfo.yearOfBirth` is less than `2017` then `educationInfo.graduationGpa` is required. 
2. GRE scores should not be more than 350 and GMAT scores should not be more than 800. 

I am not able to make these two conditions work. Especially I am more interested in knowing the behaviour of allOf and if condition inside allOf. Secondly when we are writing any if condition should we specify sub-properties only or properties from the root path.
(this is a part of very-very big schema which I have reduced for the sake of this issue)