# [794] How can I trim the string value in ajv?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
ajv version: 5.1.0

Usualy I validate the http post body with ajv, But when a string param start with space character, I'm unexpected to pass the validation, example:

```javascript
let body = {
    title: '    xx'
};

let validator = ajv.compile({
    properties: {
        title: {
            type: 'string',
            minLength: 5,
            manLength: 50,
        }
    }
});

console.log(validator(body));  //true   , unexpected
```