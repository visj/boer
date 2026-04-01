# [1783] Throw an exception during schema validation when first additional property is encountered

**What version of Ajv you are you using?**
8.6.3

**What problem do you want to solve?**
I want the user that enters data in the Json document not declared in the schema to fail when I validate it.
Like if I omitted a required field.

**What do you think is the correct solution to problem?**
Add an additional property named 'failOnAdditionalProperty: boolean' in the Options object.
When the first additional prop is encountered -> throw an exception.

**Will you be able to implement it?**
It depends on the language :-)