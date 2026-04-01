# [540] Validate method after compilation almost empty

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug reports. For other issues please use:
- a new feature/improvement: http://epoberezkin.github.io/ajv/contribute.html#changes
- browser/compatibility issues: http://epoberezkin.github.io/ajv/contribute.html#compatibility
- JSON-Schema standard: http://epoberezkin.github.io/ajv/contribute.html#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->

Hello!

I am implementing the library into an Ember app.
For some reason, after adding `draft-04/schema`, `draft-04/hyper-schema` and my own schema the validate function returned by the compilation function is almost empty and only check that the schema passed is an object, but it doesn't check each element.

I also tried the `validate` function and it returns the same.
On a side note, I tried compileAsync and AJV was looping indefinitely over the `hyper-schema` URL.

Please let me know if you need clarity on any element or if I can be of any help in the testing process.

Thank you very much!

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
```json
{ "ajv": "^5.2.2" }
````

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{ 
    allErrors: true,
    meta: false,
    extendRefs: true 
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
// Ember code, I'm just putting the basics of what could be useful

this.get('ajax').request(
    'http://json-schema.org/draft-04/schema',
    { method: 'GET' }
).then(function(metaSchema){
    self.get('validator').addMetaSchema(metaSchema, undefined, true);
    self.get('ajax').request(
        'http://json-schema.org/draft-04/hyper-schema',
        { method: 'GET' }
    ).then(function(metaHyperSchema){
        self.get('validator').addMetaSchema(metaHyperSchema, undefined, true);
        self.get('validator').removeKeyword('propertyNames');
        self.get('validator').removeKeyword('contains');
        self.get('validator').removeKeyword('const');

        self.get('validator')._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/hyper-schema';

        var validate = self.get('validator').compile(schema);
        console.log(validate);
    });
});
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

The last JSONSchema loaded is:

https://raw.githubusercontent.com/gudTECH/retailops-sdk/master/verify/schema/catalog_get_config_v1.json

```javascript
// The value of schema is the content of: https://raw.githubusercontent.com/gudTECH/retailops-sdk/master/verify/schema/catalog_get_config_v1.json

var validate = self.get('validator').compile(schema);
```


**Response received from the console log**

```javascript
(function(self, RULES, formats, root, refVal, defaults, customRules, co, equal, ucs2length, ValidationError/*``*/
) {
    var validate = (function(data, dataPath, parentData, parentDataProperty, rootData) {
        'use strict';
        var vErrors = null;
        var errors = 0;
        if ((data && typeof data === "object" && !Array.isArray(data)) ) {
            var errs__0 = errors;
            var valid1 = true;
        } else {
            var err = {
                keyword: 'type',
                dataPath: (dataPath || '') + "",
                schemaPath: '#/type',
                params: {
                    type: 'object'
                },
                message: 'should be object'
            };
            if (vErrors === null)
                vErrors = [err];
            else
                vErrors.push(err);
            errors++;
        }
        validate.errors = vErrors;
        return errors === 0;
    });
    return validate;
}
)

```