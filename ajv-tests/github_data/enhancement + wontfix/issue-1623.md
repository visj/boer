# [1623] Any method which will discard the invalid data from data object against a schema (if/else/then conditions)

```
schema = {
  type: "object",
 properties: {
    firstName: {
       type: "string"
     }
  },
  if: {
    { properties: { firstName: { const: "abc" } } }
  },
  then: {
    { properties: { lastName: { type: "string" } } }
  }
}
```

```
data = {
  firstName: "def",  // other than "abc"
  lastName: "some value"
}
```

If you observe the `data` is not satisfying the `if` condition in schema but still `data` has `lastName` value

My requirement is to have a method which will take these two as parameter and return` { firstName: "def" }` .  (Discarding the `lastName` field becasue the conditions is not matched)

