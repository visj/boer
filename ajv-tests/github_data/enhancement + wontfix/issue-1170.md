# [1170] Any thoughts on an option that would treat a "const" as the "default"

**What version of Ajv you are you using?**
Latest

**What problem do you want to solve?**
Setting a "const" essentially forces a particular value, but if it's not part of the input data, it is currently necessary to also set "default" to the same value. It seems reasonable to allow a property with a "const" to also treat that value as the "default".

**What do you think is the correct solution to problem?**
Add a Boolean option (something like `constAsDefault` or `defaultConst`); when true, a property with a "const" (and no "default") automatically uses the "const" value as the "default" value if the input data does not contain the property.

**Will you be able to implement it?**
Maybe
