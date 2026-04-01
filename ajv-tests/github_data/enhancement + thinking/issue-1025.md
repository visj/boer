# [1025] Add option to remove additional properties when additionalProperties is falsy

**What version of Ajv you are you using?**
6.10.0

**What problem do you want to solve?**
Produce clean objects by removing unknown properties when `additionalProperities` is falsy. My use case is an OpenAPI client I'm building.

**What do you think is the correct solution to problem?**
Add a `"falsy"` value to the `removeAdditional` option.

**Will you be able to implement it?**
Yes. It's trivial. See first version: https://github.com/rijx/ajv/tree/add-falsy-option