# [77] Incorrect inlining of remote refs

I want to start by saying I'm new to JSON Schema, and could be doing it wrong. If so, please let me know.

It seems like validating incorrect data in this situation changes the schema that is connected to the validating function, and I can't figure out why. I am trying to validate messages (schema id `id_message`) that have a common header format (schema id `id_header`). I think the easiest way to explain is with the code and comments, so here it is:

``` js
var ajv = (require('ajv'))({
  verbose: true,
  beautify: true
});
var inspect = require('util').inspect;

// message schema
var schemaMessage = {
  $schema: "http://json-schema.org/draft-04/schema#",
  id: "id_message",
  type: "object",
  required: ["header"],
  properties: {
    header: {
      allOf: [
        { $ref: "id_header" },
        { properties: { msgType: { "enum": [0] } } }
      ]
    }
  }
};

// header schema
var schemaHeader = {
  $schema: "http://json-schema.org/draft-04/schema#",
  id: "id_header",
  type: "object",
  properties: {
    version: {
      type: "integer",
      minimum: 4,
      maximum: 5
    },
    msgType: { type: "integer" }
  },
  required: ["version", "msgType"]
};

// a good message
var validMessage = {
  header: {
    version: 4,
    msgType: 0
  }
};

// a bad message
var invalidMessage = {
  header: {
    version: 6,
    msgType: 0
  }
};

// add schemas and get validator function
ajv.addSchema(schemaHeader);
ajv.addSchema(schemaMessage);
var validator = ajv.getSchema('id_message');

// run the test with valid message
var valid = validator(validMessage);
console.log(inspect(ajv.errorsText(validator.errors)));
console.log(inspect(validator.schema));
// returns 'No errors', as it should

// run the test with invalid message
valid = validator(invalidMessage);
console.log(inspect(ajv.errorsText(validator.errors)));
console.log(inspect(validator.schema));
// returns "'data.header.version' should be <= 5", as it should
// however, printed schema is now that of id_header, not id_message

// run the test with valid message
valid = validator(validMessage);
console.log(inspect(ajv.errorsText(validator.errors)));
console.log(inspect(validator.schema));
// returns:
// undefined:160
//              var enumSchema3 = validate.schema.properties.header.allOf[1].properties.msgType.enum,
//                                                                 ^
//
// TypeError: Cannot read property 'allOf' of undefined
```

Thanks in advance for taking the time to look at this, and thanks for ajv!
