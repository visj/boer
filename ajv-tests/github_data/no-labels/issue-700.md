# [700] custom formats issue

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

6.1.0

**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript

{
    allErrors: true,
    verbose: true
}

```


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

{
    "type": "object",
    "properties": {
        "title": {
            "description": "",
            "type": "string"
        },
        "description": {
            "type": "string",
        },
        "period": {
            "type": "daterange"
        },
        "geo": {
            "type": "geocircle"
        },
        "message": {
            "title": "Шаблон сообщения",
            "type": "string"
        },
        "precision": {
            "type": "integer"
        },
        "repeatEmitting": {
            "type": "boolean"
        }
    }
}

```

daterange: 

```json

{
  "type": "array",
  "items": {
    "type": "date",
    "minItems": 2,
    "maxItems": 2
  },
  "additionalItems": false
}

```

geocircle:

```json

{
  "type": "object",
  "properties": {
    "center": {
      "type": "object",
      "properties": {
        "lat": {
          "type": "number",
          "minimum": -90,
          "maximum": 90
        },
        "lng": {
          "type": "number",
          "minimum": -180,
          "maximum": 180
        }
      },
      "required": ["lat", "lng"]
    },
    "radius": {
      "type": "number",
      "minimum": 0
    }
  },
  "required": ["center", "radius"]
}


```


**Sample data**

```json

{}

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

https://runkit.com/vankop/5a7c86502ba35200123686ad

```javascript

import Ajv from 'ajv';
import {
    dateRangeSchema,
    geoCircleSchema
} from 'emp-admin-entity-administration-config-schema';

export const ajv = new Ajv({
    allErrors: true,
    verbose: true
});

ajv.addFormat('date', {
    type: 'integer',
    validate: () => false
});

ajv.addFormat('daterange', (dateRange) => {
    const validate = ajv.compile(dateRangeSchema);
    return validate(dateRange);
});

ajv.addFormat('geocircle', (geoCircle) => {
    const validate = ajv.compile(geoCircleSchema);
    return validate(geoCircle);
});

const validate = ajv.compile({
    "type": "object",
    "properties": {
        "title": {
            "description": "",
            "type": "string"
        },
        "description": {
            "type": "string",
        },
        "period": {
            "type": "daterange"
        },
        "geo": {
            "type": "geocircle"
        },
        "message": {
            "title": "Шаблон сообщения",
            "type": "string"
        },
        "precision": {
            "type": "integer"
        },
        "repeatEmitting": {
            "type": "boolean"
        }
    }
});

const valid = validate({});

```


**Validation result, data AFTER validation, error messages**

Error:
```
schema is invalid: data.properties['period'].type should be equal to one of the allowed values, data.properties['period'].type should be array, data.properties['period'].type should match some schema in anyOf, data.properties['geo'].type should be equal to one of the allowed values, data.properties['geo'].type should be array, data.properties['geo'].type should match some schema in anyOf

```

**What results did you expect?**

Valid schema
