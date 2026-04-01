# [1003] Strange normalization while producing the missing schema uri for loadSchema

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.10

**Context**

stoplightio/spectral#171

**Repro case**

Given the following code

```javascript
const AJV = require("ajv");
const jsonSpecv4 = require("ajv/lib/refs/json-schema-draft-04.json");
const loadSchema = async (uri) => {
    return new Promise(function (resolve, reject) {
        console.log("loadSchema invoked with uri=" + uri);

        reject(new Error('no schema named: ' + uri));
    });
}
const ajv = new AJV({
    meta: false,
    schemaId: 'auto',
    jsonPointers: true,
    loadSchema: loadSchema,
});

const aboveReference = {
    $ref: '../library.yaml#/definitions/email',
};

const localReference = {
    $ref: './library.yaml#/definitions/email',
};

ajv.addMetaSchema(jsonSpecv4);
ajv._opts.defaultMeta = jsonSpecv4.id;
ajv._refs['http://json-schema.org/schema'] = 'http://json-schema.org/draft-04/schema';

const validate = async (ajv, location) => {

    const schemaObj = {
        $ref: `${location}#/definitions/email`,
    };

    console.log("compiling...", JSON.stringify(schemaObj))
    try {
        await ajv.compileAsync(schemaObj);
    } catch (e) {
        console.log(e.message);
    }
};

(async () => {
    await validate(ajv, "../../../library.yaml");
    await validate(ajv, "./library.yaml");
})();
```

Running it generates the following output

```
compiling... {"$ref":"../../../library.yaml#/definitions/email"}
loadSchema invoked with uri=library.yaml
no schema named: library.yaml
compiling... {"$ref":"./library.yaml#/definitions/email"}
loadSchema invoked with uri=library.yaml
no schema named: library.yaml
Done in 0.37s.
```

From a Swagger 2.0 standpoint, the previous `$refs` format are valid
From #248, I clearly understand that indeed loading is out of the scope of Ajv and that Ajv has no knowledge of the execution environment.

However, would it be possible to make the missing identifier easier to disambiguate?

Indeed, both `../../../library.yaml` and `./library.yaml` resolve to a missing `library.yaml` identifier.