# [314] Can not use array index  in $data json v5

I like to validate  one array with another one but I like to use "0#" notation to get the current index of array. In this schema, "0#" returns index value and use it to index to other array.
Is it possible?
The following does not validate.

``` javascript
var schema =  {
    "properties": {
        "arr": {
            "items": [{},{},{}],
            "additionalItems": false
        },
        "sameArr": {
            "items": {
                "constant": {
                    "$data": "/arr/0#"
                },
            "additionalItems": false
        }}
    }};

var data = {
    "arr": [ 1, "abc", {"foo": "bar"} ],
    "sameArr": [ 1, "abc", {"foo": "bar"} ]
};
```

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

the latest from git

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

var options = {"v5":true};

``` javascript


```

**JSON Schema (please make it as small as possible to reproduce the issue):**

as above

**Data (please make it as small as posssible to reproduce the issue):**
as above

**Your code (please use `options`, `schema` and `data` as variables):**

``` javascript


var ajv = new Ajv(options); // options can be passed, e.g. {allErrors: true}
var validate = ajv.compile(schema);
var valid = validate(data);
if (!valid) console.log(validate.errors);

```

<!--
It would help if you post a working code sample in Tonic notebook and include the link here. You can clone this notebook: https://tonicdev.com/esp/ajv-issue.
-->

**Validation result, data AFTER validation, error messages:**

```
[ { keyword: 'constant',
    dataPath: '.sameArr[0]',
    schemaPath: '#/properties/sameArr/items/constant',
    params: {},
    message: 'should be equal to constant' } ]

```

**What results did you expect?**

validate successfully

**Are you going to resolve the issue?**

No
