# [42] Option to merge defaults

In JSON schema it's often useful for declare `defaults`, with the default value for an optional property. This is powerful for documentation, and many validators supports inserting the default into the validated object, this way you don't hardcode defaults into your code, but declare the defaults in your input schema.

**Example A)**

``` js
var Ajv = require('ajv');
var ajv = Ajv({mergeDefaults: true}); // Specify that we want defaults merged

var validate = ajv.compile({
  type: "object",
  properties: {
    myProp: { // optional property
      type: "string",
      default: "Hello World" // default value
    }
  }
});

var data = {
  someOtherProp: "another value"
};

validate(data); // true
console.log(data)
// {someOtherProp: "another value", myProp: "Hello World"}
```

This would be extremely useful, and doing this outside of the schema validation is hard, as you want to do this on all sub-objects as well, some of which may exist under an `anyOf`, so you can't insert the defaults until you're sure which `anyOf` branch is satisfied.

It's quite possible that this is a post processing step, as nested `anyOf` branches means you sometimes can't do this until after everything is validated. A possible work around might be to insert the defaults into a clone of the existing object, that way multiple `anyOf` branches shouldn't be a problem.

**Note**, this only really relevant for objects, but could also be done for arrays which has `items: [{default: ...}, {default: ...}]` (though this is a corner case). It doesn't really make sense to do this when the top-level schema type is a value type like `integer` as the input is either valid (ie. an integer) or invalid (ie. another type or `null`).

**Remark**, after inserting a default value, validator should validate the default value too. This should ideally be done a schema compile-time. It is important to do this, because the default value of a property which has `type: 'object'` may be `{}` and the schema for that object may specify properties for this that has additional default values. It would also be nice to get errors about inconsistencies at compile-time.
