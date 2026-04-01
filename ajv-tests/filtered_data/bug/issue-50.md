# [50] Incorrect fragment resolution in referenced schemas

When schemas are added to a validator using 'addSchema', referenced schemas that contain internal references result in 'can't resolve reference' errors. This does not happen if the schemas are added to the validator (in the correct order) using 'compile'.

Here is a test that demonstrates the behaviour:

```
describe.only("references with 'definitions'", function () {

    var ajv = require("ajv");

    function spec(name) {

        var method,
            result,
            validator;

        validator = ajv();
        method = validator[name];

        method.call(validator, {
            definitions: {
                name: { type: "string" }
            },
            id: "http://schemas.domain.xyz/test/person.json#",
            properties: {
                name: { $ref: "#/definitions/name"}
            },
            type: "object"
        });

        method.call(validator, {
            id: "http://schemas.domain.xyz/test/employee.json#",
            properties: {
                person: { $ref: "/test/person.json#" },
                role: { type: "string" }
            },
            type: "object"
        });

        result = validator.validate("http://schemas.domain.xyz/test/employee.json#", {
            person: {
                name: "Alice"
            },
            role: "Programmer"
        });

        expect(result).to.be.true;
        expect(validator.errors).to.be.null;
    }

    it("should be supported by 'addSchema'", function () {

        spec("addSchema");
    });

    it("should be supported by 'compile'", function () {

        spec("compile");
    });
});
```

I've looked through the source and the issue appears to have something to do with the root that's passed to the 'compile' function.

When the schemas are added with 'compile', they are compiled independently; no root is passed for the referenced schema and its internal reference is resolved correctly. The 'resolveRef' function receives:

```
baseId = http://schemas.domain.xyz/test/person.json#
ref = #/definitions/name
```

When the schemas are added with 'addSchema', the referenced schema is compiled when the referencing schema is compiled and the referencing schema is passed as the root. In this case, the root appears to be used to resolve the referenced schema's internal reference. That is, the 'resolveRef' function receives:

```
baseId = http://schemas.domain.xyz/test/employee.json#
ref = #/definitions/name
```
