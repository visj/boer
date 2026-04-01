# [129] removeAdditional doesn't work well with anyOf, oneOf or allOf

Hi, first of all, awesome work with this validator! Very handy!

Now here is the problem I'm facing, I'm not sure if this is the expected behavior, but if it is, it's not very intuitive... my scenario is a bit more complex, but I'll simplify in the following example.

I'm initializing ajv with:

``` javascript
const ajv = Ajv({removeAdditional: true})
```

This is the sample schema:

``` javascript
const schema = {
    type: `object`,
    additionalProperties: {
      anyOf: [{
        type: `object`,
        properties: {
          a: {
            type: `string`
          }
        },
        required: [`a`],
        additionalProperties: false
      }, {
        type: `object`,
        properties: {
          b: {
            type: `string`
          }
        },
        required: [`b`],
        additionalProperties: false
      }]
    }
  }
```

It should accept an object with as many objects as we want, and each of these objects should have at least one property called `a`, or one called `b`. If `a` or `b` are not present, it should fail. It should also discard any other property that is not `a` or `b`.

Now, with this data:

``` javascript
  const data1 = {
    obj1: {
      a: `a`
    },
    obj2: {
      b: `b`
    },
    obj3: {
      c: `c`
    }
  }
```

It should fail only on `obj3`, but that's only the case when `removeAdditional` is `false`. If `removeAdditional` is `true`, it seems like as soon as it evaluates the first option of the `anyOf`, it removes the additional properties of the object before trying the second option.

the removeAdditional is very useful, but it needs to wait until all possibilities of oneOf to be evaluated before removing anything.

This is the error I get by running the code above:

``` javascript
     Error: the array [
  {
    "dataPath": "['obj2']"
    "keyword": "required"
    "message": "should have required property 'a'"
    "params": {
      "missingProperty": "a"
    }
    "schemaPath": "#/additionalProperties/anyOf/0/required"
  }
  {
    "dataPath": "['obj2']"
    "keyword": "required"
    "message": "should have required property 'b'"
    "params": {
      "missingProperty": "b"
    }
    "schemaPath": "#/additionalProperties/anyOf/1/required"
  }
  {
    "dataPath": "['obj2']"
    "keyword": "anyOf"
    "message": "should match some schema in anyOf"
    "params": {}
    "schemaPath": "#/additionalProperties/anyOf"
  }
  {
    "dataPath": "['obj3']"
    "keyword": "required"
    "message": "should have required property 'a'"
    "params": {
      "missingProperty": "a"
    }
    "schemaPath": "#/additionalProperties/anyOf/0/required"
  }
  {
    "dataPath": "['obj3']"
    "keyword": "required"
    "message": "should have required property 'b'"
    "params": {
      "missingProperty": "b"
    }
    "schemaPath": "#/additionalProperties/anyOf/1/required"
  }
  {
    "dataPath": "['obj3']"
    "keyword": "anyOf"
    "message": "should match some schema in anyOf"
    "params": {}
    "schemaPath": "#/additionalProperties/anyOf"
  }
] was thrown, throw an Error :)
```

As you can see, `obj2` is failing because it's missing property `b`, which is not true.

I called validate with 

``` javascript
const result = ajv.validate(schema, data1)
```
