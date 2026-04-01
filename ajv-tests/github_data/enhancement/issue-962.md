# [962] Validate schema against examples

**What problem do you want to solve?**
We create json schema reference for our system and associate test to it.

**What do you think is the correct solution to problem?**
Because examples are a part of the json schema specification since DRAFT-06, we should also validate examples. This validation must be optional to prevent breaking change and also because "Each entry should validate against the schema in which is resides" (not a MUST... it's a SHOULD 😢 ).

**Will you be able to implement it?**
I need a closer look to the code to say that.

**Example of possible usage**

```javascript
// First proposal, not breaking change
ajv.validateSchemaExamples(schema);

// Second proposal, no breaking change if default value set to false
ajv.validateSchema(schema, true);

// Third proposal, breaking change, strict validation of examples
ajv.validateSchema(schema);

// Fourth proposal, no breaking change, fluent interface
ajv.validateSchema(schema).validateExamples();
```
