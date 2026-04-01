# [501] Optionally warn on additional properties/items (regardless of schema)

**What version of Ajv you are you using?** 5.1.3

**What problem do you want to solve?** Ensure instance does not have unintentionally misplaced properties (regardless of whether `additionalProperties: false` (or `additionalItems: false`) is set on the schema since one may not wish to impose this on all consumers of the schema).

**What do you think is the correct solution to problem?** Allow config to `Ajv` which supports reporting all unknown properties or items (including if applying to schema files). The reporting could be ignored if `additionalProperties` (or `additionalItems`) was set within the schema.

**Will you be able to implement it?** I don't think so--hands way too full atm.

