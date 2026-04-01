# [543] Add instanceof property for type objects

What about add a property `instanceof` that could validate if an object is an instance of the right class.

e.g. 
```

const MyClass = require('./MyClass.js');
const Ajv = require('ajv');
let ajv = new Ajv();

let schema = {
  "type": "object",
  "instanceof": MyClass
}

let model = new Myclass();
ajv.validate(schema, model); // valid
ajv.validate(schema, {}); // invalid
```

Then when an "instanceof" prop is defined it could simply check:
`model instanceof schema.instanceof`

I know that ajv#keyword can do the trick, but it's really not developper friendly.
Your Ajv instance has to know about all your models.
best.

