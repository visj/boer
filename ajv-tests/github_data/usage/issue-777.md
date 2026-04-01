# [777] request: Way in which to force a property value

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.4.0

**JSON Schema**

```json

                "foo": {
                    "type": "string",
                    "set": "bar"
                },

```

In this example the value of property "foo" would always equal "bar".

I have created a custom keyword to achieve something similar, but as far as I can see there is no way to have this value always exist?

```javascript
    ajv.addKeyword('set', {
        type: ['number', 'integer', 'string', 'boolean', 'array', 'object', 'null'],
        compile: (schema, parentSchema) => {
            //set the value to whatever is specified in "schema". Warning: we have to "set" the property we are applying
            //this custom keyword to either required or have a default. If we dont do this then the value might not exist!
            //if the value does not exist exist, then we cant set it!
            return (data, dataPath, parentObject, propName, rootData) => {
                parentObject[propName] = schema;

                //always success
                return true;
            };
        },
        valid: true,
        errors: false,
        modifying: true,
    });
```

If in our schema we fail to make the property have a `default` or be `required` then the validation function (naturally) will never get called. In turn this means that the value wont be "set".
