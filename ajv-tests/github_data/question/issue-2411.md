# [2411] option compile from addKeyword doesn't change on a remove and then add again

Here my issue (if it's one):

I setup a keyword with addKeyword and the compile option. I have some external variables used inside. At the first iteration everything is ok, but at the second one we see the variables doesn't change. Is it a normal behavior or an issue ?

**What version of Ajv are you using?**

version 8.12.0

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const AjvModule = require('ajv');
const ajv = new AjvModule();

const keyword = "variableKeywork";
const schema = {
    "description": "test",
    "type": "object",
    "properties": {
        "item1": {
            "type": "string"
        }
    },
    "variableKeywork": true
};

test({
    item1: "test"
}, true);
console.log('-------------------------');

setTimeout(() => {
    test({
        item1: 1
    }, false);
}, 5000);

function test(desc, value) {
    const now = new Date();
    const time = now.getTime();
    console.log(`Current time: ${time}`);
    ajv.addKeyword({
        keyword: keyword,
        modifying: true,
        compile: (value) => function validate(data, root) {
            console.log(`Time inside addKeyword: ${time} and value = ${value}`);
            return true
        }
    });
    console.log(`keyword present : ${JSON.stringify(ajv.getKeyword(keyword))}`);
    const validate = ajv.compile(schema);
    const isDataValid = validate(desc);
    ajv.removeKeyword(keyword);
    console.log(`data valid: ${isDataValid}`)
    console.log(`keyword present: ${JSON.stringify(ajv.getKeyword(keyword))}`);
}
```

**Output obtained**

```
Current time: 1716967536094
keyword present : {"keyword":"variableKeywork","modifying":true,"type":[],"schemaType":[]}
Time inside addKeyword: 1716967536094 and value = true
data valid: true
keyword present: false
-------------------------
Current time: 1716967541145
keyword present : {"keyword":"variableKeywork","modifying":true,"type":[],"schemaType":[]}
Time inside addKeyword: 1716967536094 and value = true
data valid: false
keyword present: false
```

**What results did you expect?**

the ajv.removeKeyword really remove the keyword and allow us the define it again.

**Are you going to resolve the issue?**
