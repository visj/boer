# [2492] Any object is valid

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
          "ajv": "https://esm.sh/ajv@8.17.1",

**Ajv options object**

```javascript
const ajv = new Ajv({code: {esm: true}, allErrors: true});
```

**Your code**

```javascript
const validate = ajv.compile({"type":"object","properties":{"heartbeat":{"type":"string","pattern":"please"}}})
validate({a: 1}) //true
validate.errors // == []
```

*** generated code from debugger ***
```js
function anonymous(self, scope
) {
    const schema13 = scope.schema[8];
    const pattern0 = scope.pattern[0];
    return function validate12(data, {instancePath="", parentData, parentDataProperty, rootData=data}={}) {
        let vErrors = null;
        let errors = 0;
        if (errors === 0) {
            if (data && typeof data == "object" && !Array.isArray(data)) {
                if (data.heartbeat !== undefined) {
                    let data0 = data.heartbeat;
                    const _errs1 = errors;
                    if (errors === _errs1) {
                        if (typeof data0 === "string") {
                            if (!pattern0.test(data0)) {
                                validate12.errors = [{
                                    instancePath: instancePath + "/heartbeat",
                                    schemaPath: "#/properties/heartbeat/pattern",
                                    keyword: "pattern",
                                    params: {
                                        pattern: "please"
                                    },
                                    message: "must match pattern \"" + "please" + "\""
                                }];
                                return false;
                            }
                        } else {
                            validate12.errors = [{
                                instancePath: instancePath + "/heartbeat",
                                schemaPath: "#/properties/heartbeat/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            }];
                            return false;
                        }
                    }
                }
            } else {
                validate12.errors = [{
                    instancePath,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                }];
                return false;
            }
        }
        validate12.errors = vErrors;
        return errors === 0;
    }
}
```
