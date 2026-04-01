# [1954] Ability to see if validator modified data

**What version of Ajv you are you using?**
v8.6.3

**What problem do you want to solve?**
I want toknow if running the validator has modified the data or not without needing to do a comparison of the data after running the validator myself.

**What do you think is the correct solution to problem?**
It can append a property `dataModified` as a boolean to the validator function similar to `errors`.

**Will you be able to implement it?**
If I get a reference on where best to make the change yes.