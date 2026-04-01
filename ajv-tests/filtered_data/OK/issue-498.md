# [498] Problem with $data validation after migrating to 5.x.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

5.1.3

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
new Ajv({useDefaults: true, v5: true});
```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
{
        $id: 'Foo',
        'properties': {
            'startOffset': {
                'type': 'integer',
                'minimum': 0
            },
            'endOffset': {
                'type': 'integer',
                'minimum': {'$data': '1/startOffset'},
            }
        }
}

```


**Sample data**

<!-- Please make it as small as posssible to reproduce the issue -->

```javascript
{'startOffset': 1, 'endOffset': 0}
```


**Validation result, data AFTER validation, error messages**

```
Error: schema is invalid: data.properties['endOffset'].minimum should be number
```

**What results did you expect?**
This had worked in the past with an earlier version of ajv. I can't migrate my schema automatically because it is embedded inside some JavaScript code.

**Are you going to resolve the issue?**
I've read section on `$data` properties, and it seems like I did it right, but not sure how `minimum` can be a number at this point.