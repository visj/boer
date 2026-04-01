# [18] Errors for 'required' validation should include missing property

Hi, I'm trying to get some clarity on a potential issue I'm seeing. In running the following:

```
const ajv = Ajv({verbose: false, allErrors: true});

ajv.addSchema([
   require('./schemas/Currency.json'),
   require('./schemas/PositiveFloatString.json'),
   require('./schemas/Amount.json'),
   require('./schemas/Party.json'),
])

function isValid(object, schemaName) {
  return ajv.validate(schemaName, object);
}

function validate(object, schemaName) {
  if (!isValid(object, schemaName)) {
    return {
      isValid: false,
      errors: ajv.errors
    };
  }
  return {
    isValid: true
  };
}

console.log(validator.validate({
        entity: 'acct:conner@ropple.com',
        amount: {
          currency: 'USD'
        }
      }, 'Party'));
```

I get the following:

```
{ 
  isValid: false,
  errors: [{ 
    keyword: 'required',
     dataPath: '.amount',
     message: 'properties value, currency are required' 
  }]
}
```

Ideally I would like to see something more along the lines of:

```
{ 
  isValid: false,
  errors: [{ 
    keyword: 'required',
    dataPath: '.amount.value',
    message: 'property value is required' 
  }]
}
```

I was wondering if this was an issue with my implementation / schemas or if it is a shortcoming of ajv?

Thanks in advance.

My schemas are as follows:
Party.json

```
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "Party",
  "title": "Party",
  "description": "Represents a single party to a payment.",
  "type": "object",
  "properties": {
    "name": {
      "$ref": "Account"
    },
    "amount": {
      "description": "How much this party will send or receive in the payment.",
      "$ref": "Amount"
    }
  },
  "additionalProperties": false,
  "required": ["name", "amount"]
}
```

Amount.json

```
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "Amount",
  "title": "Amount",
  "type": "object",
  "properties": {
    "value": {
      "$ref": "PositiveFloatString"
    },
    "currency": {
      "type": "string",
      "$ref": "Currency"
    }
  },
  "additionalProperties": false,
  "required": ["value", "currency"]
}
```

PositiveFloatString.json

```
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "PositiveFloatString",
  "title": "PositiveFloatString",
  "description": "A string representation of a floating point number",
  "type": "string",
  "pattern": "^[+]?[0-9]*[.]?[0-9]+([eE][-+]?[0-9]+)?$"
}
```

Currency.json

```
{
  "$schema": "http://json-schema.org/draft-04/schema#",
  "id": "Currency",
  "title": "Currency",
  "type": "string",
  "pattern": "^(([a-zA-Z0-9]{3})|([a-fA-F0-9]{40}))$"
}
```
