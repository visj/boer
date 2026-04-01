# [2134] Let users configure Cache to use for compiled schemas

**What version of Ajv you are you using?**
8.11.0

**What problem do you want to solve?**
If `compile` function called with same by-value, but not by-ref object, it can cause cache overflow and memory leakage.
```
const getSchema = () => ({ type: 'object' });
const schema1 = getSchema();
const schema2 = getSchema();
console.log('schemas are equal by-ref? ', schema1 === schema2);

// caching is not actually works down here
// Map is growing, nothing cleans it
ajv.compile(schema1);
ajv.compile(schema2);
ajv.compile(getSchema());
...
ajv.compile(getSchema());
```


**What do you think is the correct solution to problem?**
Implement WeakMap instead of Map class.

**Will you be able to implement it?**
I'll attach the pull request.
