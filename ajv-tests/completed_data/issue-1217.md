# [1217] anyOf not running all async sub schemas

I wanted to start by saying thank you for writing this awesome JSON validator. Below is an issue I am having with async keyword validations with the `anyOf` keyword.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

"ajv": "^6.12.2",
"ajv-errors": "^1.0.1",
"ajv-keywords": "^3.4.1",



**Ajv options object**
```javascript
const Ajv = require('ajv');
const ajvErrors = require('ajv-errors');
const ajvKeywords = require('ajv-keywords');

const AJV = new Ajv({ allErrors: true, jsonPointers: true, transpile: false, removeAdditional: true });
ajvErrors(AJV);
ajvKeywords(AJV, 'transform');
```


**Your code**

```javascript
const swiftBicSchema = {
  $async: true,
  required: ['swift_bic'],
  properties: {
    swift_bic: {
      type: 'string',
      validSWIFT: true
    }
  }
};

const bankCodeSchema = {
  $async: true,
  properties: { bank_code: { validBankCode: true } }
};

const ibanSchema = {
  $async: true,
  required: ['account_number'],
  properties: { account_number: { validIBAN: true } }
};

const bankDetailsAsyncSchema = {
  $async: true,
  type: 'object',
  anyOf: [
    swiftBicSchema,
    bankCodeSchema,
    ibanSchema
  ]
};


AJV.addKeyword('validIBAN', {
  async: true,
  type: 'string',
  validate: isValidIBAN,
  errors: false
});

AJV.addKeyword('validSWIFT', {
  async: true,
  type: 'string',
  validate: isValidSWIFT,
  errors: false
});

AJV.addKeyword('validBankCode', {
  async: true,
  type: 'string',
  validate: isValidBankCode,
  errors: false
});


// all async validate functions are in exact same format as below
async function isValidSWIFT(schema, swiftBic, parentSchema, dataPath, parentDataObject) {
  const resp = await routefuze.bankSearch(source, { country: parentDataObject.country, query: swiftBic, user_id: 1 });
  if (resp instanceof Error || resp.data.length === 0) return Promise.reject(new ValidationError([{ keyword: 'swift', message: `${swiftBic.toUpperCase()} is not a valid swift_bic` }]));

  return true;
}
```


**Validation result, data AFTER validation, error messages**

```
[ValidationError: validation failed] {
  message: 'validation failed',
  errors: [
    {
      keyword: 'swift',
      message: 'VALLMTMTXZX is not a valid swift_bic'
    }
  ],
  validation: true,
  ajv: true
}

```

**What results did you expect?**
I am expecting all async validations to be run until a schema within `anyOf` returns true, or all schemas fail. Instead, Ajv looks to fail the parent schema when the first async validation fails.
I would expect the above ValidationError to include all errors from the `anyOf` schemas array.

**Are you going to resolve the issue?**
I'm open to helping resolve the issue if this is actually a bug.