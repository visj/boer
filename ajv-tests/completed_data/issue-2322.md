# [2322] A referenced schema with a discriminator, validates when it shouldn't, and doesn't have default values injected.

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

I would expect with the following schema with a discriminator to either validate the document as invalid or inject the defaults into the fields "a" and "b". (Preferably I would like it to inject the defaults). Instead it validates the document as valid.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.12.0 / Yes

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
ajv = new Ajv({
      strict: false,
      strictRequired: false,
      allErrors: true,
      useDefaults: 'empty',
      coerceTypes: false,
      discriminator: true,
});
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
 {
  "properties": {
    "layout": {
      "ref": "layouts"
    },
    "fallback": {
      "ref": "layouts"
    }
  },
  "$defs": {
    "layouts": {
      "type": "object",
      "discriminator": {
        "propertyName": "modelid"
      },
      "required": [
        "modelid"
      ],
      "oneOf": [
        {
          "$ref": "one-column"
        },
        {
          "$ref": "two-column"
        }
      ]
    },
    "one-column": {
      "$id": "one-column",
      "type": "object",
      "properties": {
        "modelid": {
          "const": "one-column"
        },
        "a": {
          "type": "string",
          "default": "Foo"
        }
      },
      "required": [
        "a"
      ]
    },
    "two-column": {
      "$id": "two-column",
      "type": "object",
      "properties": {
        "modelid": {
          "const": "two-column"
        },
        "b": {
          "type": "string",
          "default": "Bar"
        }
      },
      "required": [
        "b"
      ]
    }
  }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "layout": {
      "modelid": "one-column"
    },
    "fallback": {
      "modelid": "two-column"
    }
  }
```

**Your code**

Example showing the issue

https://runkit.com/alan-strickland-red/64de1f61c3ce1000082530b5

**Validation result, data AFTER validation, error messages**

Valid: True

```
{
    "layout": {
      "modelid": "one-column"
    },
    "fallback": {
      "modelid": "two-column"
    }
}
```

**What results did you expect?**

Valid: True

```
{
  layout: {
    modelid: "one-column",
    a: "Foo"
  },
  fallback: {
    modelid: "two-column",
    b: "Bar"
  }
}
```

or

Valid: False (must have required property 'a', must have required property 'b')

```
{
    "layout": {
      "modelid": "one-column"
    },
    "fallback": {
      "modelid": "two-column"
    }
}
```


**Are you going to resolve the issue?**

If someone can point me in the right direction, I could give it a go.
