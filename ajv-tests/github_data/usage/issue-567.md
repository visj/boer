# [567] Access to the source rootData from the custom keyword validator

Can I get access to the source rootData (that not changed by rules) from the custom keyword validator?

```
addKeyword('myKey', {
      modifying: true,
      compile: (sch, parentSchema) => {
        return (data, dataPath, parentObject, propName, rootData) => {
             console.log(rootData); // <<--- rootData is already changed
             return true;
        };
      }
```