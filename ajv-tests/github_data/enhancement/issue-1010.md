# [1010] Allow for configuring validation errors by paths

**What version of Ajv you are you using?**

`ajv@6.10.0`

**What problem do you want to solve?**

Let's say that the JSON Schema used to verify a value uses `oneOf` _(or something similar where multiple schemas are consulted, and may each have N reasons to fail validation)_ and a single mistake in the data results in N unique validation errors for each schema in the `oneOf`.  A real-world example:

* Data: https://github.com/OAI/OpenAPI-Specification/blob/master/examples/v2.0/json/petstore.json
* JSON Schema: https://github.com/OAI/OpenAPI-Specification/blob/master/schemas/v2.0/schema.json

If I change line 32 in the `petstore.json` from `query` to `elsewhere`, the `oneOf` on line `925` of `schema.json` results in multiple errors:

```json
[
  {
    "keyword": "additionalProperties",
    "dataPath": "/paths/~1pets/get/parameters/0",
    "schemaPath": "#/additionalProperties",
    "params": {
      "additionalProperty": "type"
    },
    "message": "should NOT have additional properties"
  },
  {
    "keyword": "enum",
    "dataPath": "/paths/~1pets/get/parameters/0/in",
    "schemaPath": "#/properties/in/enum",
    "params": {
      "allowedValues": [
        "header"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": "/paths/~1pets/get/parameters/0/in",
    "schemaPath": "#/properties/in/enum",
    "params": {
      "allowedValues": [
        "formData"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": "/paths/~1pets/get/parameters/0/in",
    "schemaPath": "#/properties/in/enum",
    "params": {
      "allowedValues": [
        "query"
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "enum",
    "dataPath": "/paths/~1pets/get/parameters/0/required",
    "schemaPath": "#/properties/required/enum",
    "params": {
      "allowedValues": [
        true
      ]
    },
    "message": "should be equal to one of the allowed values"
  },
  {
    "keyword": "oneOf",
    "dataPath": "/paths/~1pets/get/parameters/0",
    "schemaPath": "#/oneOf",
    "params": {
      "passingSchemas": null
    },
    "message": "should match exactly one schema in oneOf"
  },
  {
    "keyword": "oneOf",
    "dataPath": "/paths/~1pets/get/parameters/0",
    "schemaPath": "#/oneOf",
    "params": {
      "passingSchemas": null
    },
    "message": "should match exactly one schema in oneOf"
  },
  {
    "keyword": "additionalProperties",
    "dataPath": "/paths/~1pets/get/parameters/0",
    "schemaPath": "#/additionalProperties",
    "params": {
      "additionalProperty": "name"
    },
    "message": "should NOT have additional properties"
  },
  {
    "keyword": "oneOf",
    "dataPath": "/paths/~1pets/get/parameters/0",
    "schemaPath": "#/items/oneOf",
    "params": {
      "passingSchemas": null
    },
    "message": "should match exactly one schema in oneOf"
  }
]
```

**What do you think is the correct solution to problem?**

In the example above, there is only one problematic path _(`/paths/~1pets/get/parameters/0`)_ and it would be nice for a tooling author to identify this.  _(This might be specific to `oneOf` and similar, something to think about.)_

It would be nice to have an option to allow the grouping of errors by path so that you can report a singular error, like _"Not a valid parameter definition"_, instead of each individual reason as to why the singular data path is invalid.  [z-schema](https://github.com/zaggino/z-schema) does this as well, by putting the individual reasons into an error property called `inner`.  `z-schema` actually groups `oneOf` errors into its own group of failing errors.  Below is the same document validated with `z-schema` _(for reference)_:

```json
[
  {
    "code": "ONE_OF_MISSING",
    "params": [],
    "message": "Data does not match any schemas from 'oneOf'",
    "path": [
      "paths",
      "/pets",
      "get",
      "parameters",
      "0"
    ],
    "schemaId": "http://swagger.io/v2/schema.json#",
    "inner": [
      {
        "code": "ONE_OF_MISSING",
        "params": [],
        "message": "Data does not match any schemas from 'oneOf'",
        "path": [
          "paths",
          "/pets",
          "get",
          "parameters",
          "0"
        ],
        "inner": [
          {
            "code": "OBJECT_MISSING_REQUIRED_PROPERTY",
            "params": [
              "schema"
            ],
            "message": "Missing required property: schema",
            "path": []
          },
          {
            "code": "ONE_OF_MISSING",
            "params": [],
            "message": "Data does not match any schemas from 'oneOf'",
            "path": [],
            "inner": [
              {
                "code": "ENUM_MISMATCH",
                "params": [
                  "elsewhere"
                ],
                "message": "No enum match for: elsewhere",
                "path": [
                  "in"
                ],
                "description": "Determines the location of the parameter."
              },
              {
                "code": "ENUM_MISMATCH",
                "params": [
                  "elsewhere"
                ],
                "message": "No enum match for: elsewhere",
                "path": [
                  "in"
                ],
                "description": "Determines the location of the parameter."
              },
              {
                "code": "ENUM_MISMATCH",
                "params": [
                  "elsewhere"
                ],
                "message": "No enum match for: elsewhere",
                "path": [
                  "in"
                ],
                "description": "Determines the location of the parameter."
              },
              {
                "code": "ENUM_MISMATCH",
                "params": [
                  false
                ],
                "message": "No enum match for: false",
                "path": [
                  "required"
                ],
                "description": "Determines whether or not this parameter is required or optional."
              }
            ]
          }
        ]
      },
      {
        "code": "OBJECT_MISSING_REQUIRED_PROPERTY",
        "params": [
          "$ref"
        ],
        "message": "Missing required property: $ref",
        "path": [
          "paths",
          "/pets",
          "get",
          "parameters",
          "0"
        ]
      }
    ]
  }
]
```

**Will you be able to implement it?**

Sure!