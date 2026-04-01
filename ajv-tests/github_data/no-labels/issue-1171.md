# [1171] addSchema() produces error when {nullable: true}

Using `nullable: true` option when calling `addSchema()` an error is thrown:
```
Error: schema with key or id "" already exists
```

**What version of Ajv are you using?**
Ajv version: 6.12.0 (atm latest)

**Example code to reproduce**
```javascript
const Ajv = require('ajv');

const schema = {
    type: 'string',
    nullable: true,
};
const value1 = 'string';
const value2 = null;

const ajv = new Ajv({nullable: true});
ajv.addSchema(schema, '#');
const valid1 = ajv.validate('#', value1);
const valid2 = ajv.validate('#', value2);

console.log(valid1);
console.log(valid2);
```

**A bit more details**
On the example code when you remove the `nullable` option everything works as expected and the console prints `true` and `false`. Setting the option to either `nullable: true` or `nullable: false` produces the error.

**What results did you expect?**
Not throwing error and console logging `true` 2 times.

**Are you going to resolve the issue?**
No, but I will provide a workaround in the comments.