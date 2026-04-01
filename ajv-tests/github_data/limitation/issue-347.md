# [347] Base Schema using $merge and the loadSchema option

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
4.9.0
**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
{ allErrors: true, v5: true }
```

Hi there.

I have been spending the last week or so getting into json schema. I'm really impressed with it so far although the lack of examples is a little frustrating.

I find this lib the best I have evaluated, you also seem active in this community so I thought I'd post the question here, even though it's not entirely related to AJV ;)


My issue is in trying to find the best way separate and reuse schemas.

For example, I have a schema that represents a database entity and I am exposing that resource with a HTTP API defined with hyper-media. I want to reuse bits of schema for both the database validation and the API payload validation. I can see there are various ways of achieving this. I tried `allOf`, `$patch` and `$merge`

I have settled on using `$merge`. I use a base schema to represent the POST payload and the my db schema builds on this and adds an `id` property. ~~This code works fine:~~ This code doesn't work as I thought. The required arrays are not merged - the base schema gets overwritten.

```js
const Ajv = require('ajv')
const validator = new Ajv({ allErrors: true, v5: true })
require('ajv-merge-patch')(validator)

var baseSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    sku: { type: 'string' },
    price: { type: 'number', minimum: 0 }
  },
  additionalProperties: false,
  required: ['name', 'sku', 'price']
}

var schema = {
  $merge: {
    source: { $ref: 'product' },
    with: {
      properties: {
        id: { type: 'string', format: 'uuid' }
      },
      required: ['id'],
      additionalProperties: false
    }
  }
}

validator.addSchema(baseSchema, 'product')
const validate = validator.compile(schema)

const result = validate({
  id: '6438850b-b33d-475f-95d7-8997606431a5',
  name: 'Apple iPhone',
  sku: 'ABC001',
  price: 1
})

console.log(result)
//=> true
console.log(validate.errors)
//=> null
```

My first question is do you agree with this approach?


Secondly, I'd also like these schema to live in separate files and, rather than using `addSchema`, I'd like to use the `loadSchema` option to resolve the dependant schemas. I can't seem to get this to work though.

`base-product.json`
```js
{
  "id": "base-product.json",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "sku": { "type": "string" },
    "price": { "type": "number", "minimum": 0 }
  },
  "additionalProperties": false,
  "required": [ "name", "sku", "price" ]
}
```

`product.json`
```js
{
  "id": "product.json",
  "$merge": {
    "source": { "$ref": "base-product.json" },
    "with": {
      "properties": {
        "id": { "type": "string", "format": "uuid" }
      },
      "required": [ "id" ],
      "additionalProperties": false
    }
  }
}
```

```js
const fs = require('fs')
const Ajv = require('ajv')

function loadSchema (uri, callback) {
  console.log('loadSchema', uri)
  var filePath = __dirname + '/' + uri
  fs.readFile(filePath, (err, data) => {
    if (err) callback(err)
    callback(null, data)
  })
}

const ajv = new Ajv({ loadSchema: loadSchema })
const schema = require('./product.json')

ajv.compileAsync(schema, function (err, validate) {
  if (err) return

  const result = validate({
    id: '6438850b-b33d-475f-95d7-8997606431a5',
    name: 'Apple iPhone',
    sku: 'ABC001',
    price: 1
  })

  console.log(result)
  console.log(validate.errors)
})

```

This doesn't seem to work though. loadSchema never gets called and, although no errors are present in the callback for `compileAsync`, the validate function is not correct and seems to allow anything.


Apologies for the lengthy issue - I hope it all makes sense.