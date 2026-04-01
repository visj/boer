# [692] 6.1.1 oneof validate error

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.1.1

**Ajv options object**

```javascript

new ajv({
    allErrors: true,
    jsonPointers: true,
    useDefaults: true,
    format: "full",
    $data: true,
    errorDataPath: "property",
    removeAdditional: true,
})

```


**JSON Schema**

```javascript

{
    type: "object",
    $id: "design",
    required: ["name"],
    properties: {
        name: {
            type: "string"
        },
        appType: {
            oneOf: [{
                $id: "design-app-type-1",
                type: "object",
                properties: {
                    a: {
                        type: "string",
                        title: "test-oneof-2"
                    }
                }
            }, {
                $id: "design-app-type-2",
                type: "object",
                properties: {
                    b: {
                        type: "string",
                        title: "test-oneof-2"
                    }
                }
            }]
        }
    }
}

```


**Sample data**

```javascript

{
    name: "nick",
    appType: {
        a: "dkfkald"
    }
}

```


**Your code**

```javascript


```


**Validation result, data AFTER validation, error messages**

```
[{
dataPath:"/appType",
keyword:"oneOf",
message:"should match exactly one schema in oneOf",
schemaPath:"#/properties/appType/oneOf"
}]

```

**What results did you expect?**

validate should be true

**Are you going to resolve the issue?**
