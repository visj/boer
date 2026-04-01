# [1993] JTD - support float32 and float64 ranges (with option)

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.0

**Ajv options object**

I'm using the default options.

**JTD Schema**

```json
{
    "properties": {
        "outOfRangeFloat32": { "type": "float32" },
        "infinitiy": { "type": "float64" }
    }
}

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
const data = {
    outOfRangeFloat32: 6E+38,
    infinitiy: Infinity
};

```

```javascript
import Ajv, { JTDDataType } from 'ajv/dist/jtd';
const ajv = new Ajv();

const schema = {
    properties: {
        outOfRangeFloat32: { type: 'float32' },
        infinitiy: { type: 'float64' }
    }
} as const;

type MyData = JTDDataType<typeof schema>

const validate = ajv.compile<MyData>(schema);

const invalidData = {
    outOfRangeFloat32: 6E+38,
    infinitiy: Infinity
};


if (validate(invalidData)) {
    console.log('The following should be invalid:\n', invalidData);
} else {
    console.log(validate.errors);
}

```

**Validation result, data AFTER validation, error messages**

```
no errors after validation, data are considered as valid
```

**What results did you expect?**
The same behaviour as it is in case of integer data types. If a value is out of range of the defined data type, then the `ValidationFunction` should return `false` and an errors should be added to the `errors` list.

Validation in case of the integer types:
https://github.com/ajv-validator/ajv/blob/e73bc750634947f4270597136e203c27213aa565/lib/vocabularies/jtd/type.ts#L66

In case of `float32` and `float64` is such a validation missing:
https://github.com/ajv-validator/ajv/blob/e73bc750634947f4270597136e203c27213aa565/lib/vocabularies/jtd/type.ts#L58
