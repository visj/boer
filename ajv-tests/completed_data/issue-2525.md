# [2525] AJV user defined keyword using "code" function

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
v8.17.1

Currently, I am using "validate" function in a user defined keyword, which works fine but which needs to be replaced with "code" function as I am moving the schema compilation to build time due to _CSP Exceptions_ in runtime like mentioned here https://ajv.js.org/standalone.html. AJV standalone validation code with user defined keywords supports only "code" and "macros" functions, and I have few custom keywords in my application. I am a bit struggling in replacing the "validate" function as not sure how to read the data and do the comparison like below.

**Schema:**
```
{
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "src/schemas/test.schema.json",
    "type": "object",
    "properties": {
        "validFrom": {
            "type": "string",
            "format": "ISO-8601",
            "compareDates": {
                "$data": "1/validTo"
            },
            "examples": ["2022-10-11T10:27:14Z", "2022-10-11T10:27Z"]
        },
        "validTo": {
            "type": "string",
            "format": "ISO-8601",
            "examples": ["2022-10-11T10:27:14Z", "2022-10-11T10:27Z"]
        }
    }
}
```

**Current**: working keyword "compareDates"
```
const ajv = new Ajv({
                allErrors: true,
                $data: true,
                schemas: schemas
            });
...
ajv.addKeyword({
        keyword: 'compareDates',
        type: 'string',
        $data: true,
        validate: (targetDate: Date, sourceDate: Date) => {
            const timeForTargetDate = new Date(targetDate).getTime();
            const timeForSourceDate = new Date(sourceDate).getTime();
            if (timeForSourceDate >= timeForTargetDate) {
                return false;
            }
            return true;
        },
        error: {
            message: 'invalid dates'
        }
    })
```
**Required:**
```
const ajv = new Ajv({
                allErrors: true,
                $data: true,
                schemas: schemas,
                code: {
                    source: true,
                    formats: require('./formats')
                }
            });
...
ajv.addKeyword({
        keyword: 'compareDates',
        type: 'boolean',
        schemaType: 'boolean',
        $data: true,
        code(cxt) {
            const { data, $data, schema } = cxt;
            //$data does not have validTo property value(see screenshot)
            const validFrom = data;
            const validTo = $data;
            gen.code(_`console.log(${validFrom})`); // prints '2022-01-01T00:00:01.000Z'
            gen.code(_`console.log(${validTo})`); // prints "1/validTo" ???
        },
        errors: false
    });
```
context screenshot: 
![image](https://github.com/user-attachments/assets/b15a419f-a19f-4fd9-8773-b9e98165b722)
