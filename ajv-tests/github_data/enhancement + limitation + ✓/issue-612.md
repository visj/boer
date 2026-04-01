# [612] async validation with recursive ref to sub-schema passes if error is after recursion

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

version: 5.3.0

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{
   allErrors: true,
    removeAdditional: true,
    jsonPointers: true,
    extendRefs: true,
    inlineRefs: true,
    missingRefs: true,
    async: "es7",
    useDefaults: true,
    $data: true,
    errorDataPath: "property"
}
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript

{
    "$async": true,
    id: "test",
    type: "object",
    title: "测试SCHEMA",
    required: ["name"],
    properties: {
        name: { type: "string", "title": "昵称", "default": "nora", description: "昵称，必填" },
       array1: {
            "$async": true,
            type: "array",
            title: "测试无限极数组类型",
            items: {
                "$async": true,
                type: "object",
                required: ["test"],
                properties: {
                    test: {
                        type: "string",
                        title: "无限极测试数据",
                        description: "这个字段需要通过远程验证，输入nick试试",
                        minLength: 3,
                        idExists: { "table": "posts" },
                    },
                    children: { $ref: "test#/properties/array1" }
                }
            }
        }
    }
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```javascript
{
    name: "dlkjkxfa",
    array1: [{
        test: "nick",
        children: [{
            test: "nick",
            children: [{
                children: [{

                }]
            }]
        }]
    }]
}

```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript

const curAjv = new Ajv({
    allErrors: true,
    removeAdditional: true,
    jsonPointers: true,
    extendRefs: true,
    inlineRefs: true,
    missingRefs: true,
    async: "es7",
    useDefaults: true,
    $data: true,
    errorDataPath: "property"
});
curAjv.addKeyword("idExists", {
    async: true,
    type: "string",
    validate: ((sch: any, data) => {
        return new Promise<any>((resolve, reject) => {
            if (!data) {
                return resolve(true);
            }
            setTimeout(() => {
                resolve(data === "nick");
            }, 1000);
        });
    }) as SchemaValidateFunction
});
(curAjv.compile(schema)({
    name: "dlkjkxfa",
    array1: [{
        test: "nick",
        children: [{
            test: "nick",
            children: [{
                children: [{

                }]
            }]
        }]
    }]
}) as Promise<any>).catch(console.error).then(console.log);
```


**Validation result, data AFTER validation, error messages**

```
Uncaught (in promise) ValidationError {message: "validation failed", errors: Array(1), validation: true, ajv: true}
```

**What results did you expect?**

I can't catch the whole errors.

**Are you going to resolve the issue?**

yes
