# [2589] 8.18.0 causes eslint incompatibility

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.18.0 introduced the bug - I updated to this because of the audit/vulnerability fix https://github.com/ajv-validator/ajv/issues/2581

It seems in eslint a new `Ajv` instance is created and then the `_opts` object is accessed to set `defaultMeta` - but in the new version `_opts` is undefined - should this be resolved in eslint or here? As it's a feature release, perhaps not defining this object property anymore is a breaking change?

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json

```

**Your code**
In eslint line 385 of eslint-universal.cjs tries this
```
ajv._opts.defaultMeta = metaSchema.id;
```

The whole function block:\
```
var ajvOrig = (additionalOptions = {}) => {
    const ajv = new Ajv__default["default"]({
        meta: false,
        useDefaults: true,
        validateSchema: false,
        missingRefs: "ignore",
        verbose: true,
        schemaId: "auto",
        ...additionalOptions
    });

    ajv.addMetaSchema(metaSchema);
    // eslint-disable-next-line no-underscore-dangle -- part of the API
    ajv._opts.defaultMeta = metaSchema.id;

    return ajv;
};
```


**Validation result, data AFTER validation, error messages**

```

```

**What results did you expect?**

**Are you going to resolve the issue?**
SORRY for the rushed report, just wanted to make this issue around in case someone else gets the error running eslint
```
TypeError: Cannot set properties of undefined (setting 'defaultMeta')
```