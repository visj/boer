# [94] Only the first dependency of multiple ones works

Hi,

I think I might have stumbled on a bug when evaluating dependencies:

```
var ajv = require('ajv')();

console.log(ajv.validate(
{
   type: "object",
   dependencies : {
      "bar" : [ "baz" ],
      "foo" : [ "bar" ]
   }
},
{
   foo : "test"
}));
```

This should give "false" (as the object clearly misses the property "bar"), but returns true. Switching places of the dependency entries makes it work (although the bar-Dependency would stop working then).

Tested node v0.12.5 and ajv 3.0.3.
