# [2236] Boolean "is true" validation?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
 "ajv": "^8.11.0",

**Your javascript code**
```javascript
{
        type: "object",
        properties: {
              userDataProcessing: {
                  type: "boolean", const: true, nullable: false
              }
       },
       required: ["userDataProcessing"]
    }
```


body :

{
}


How to validate  boolean isTrue. Why const is not working?  Maybe it is possible but it is not documented.  

