# [379] Allow to track unknown additional properties found

**What version of Ajv you are you using?**
4.10.0

**What problem do you want to solve?**
When a schema sets additionalProperties to false or to another schema and the input data contains additional properties not present in the schema I'd like to known which are those additional properties. This is useful if the client starts sending new properties in the JSON and I want my software to continue processing it while notifying me that there are new properties in the JSON, that could require an adaptation of the program, for example.

**What do you think is the correct solution to problem?**
One possible solution is to create a new option 'warnings' : (true|false) that indicates that warnings will be collected. Then for each additional property found a new warning will be added. These warnings will be accessible via the validate object  (.e.g.: validate.warnings)

In the future warnings can be used to signal other situations.

**Will you be able to implement it?**
Yes
