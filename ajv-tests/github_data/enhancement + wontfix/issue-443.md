# [443] Change signature of validating functions to use objects instead of positional arguments

**Problem**

Compiled validating functions (and validating functions used in custom keywords) currently have 5 arguments:
- data
- dataPath
- parentData
- parentDataProperty
- rootData

If the custom keyword is "validate" kind, then the function has 7 arguments:
- schema
- data
- parentSchema
- dataPath
- parentData
- parentDataProperty
- rootData

All these arguments are positional so there are usual problems that functions with large number of positional arguments have (need to remember order, all arguments have to be used etc.).

I also need to add at least one more parameter.

**Solution**

Change function signatures.

Validating functions:
- data
- an object with properties:
  - data
  - dataPath
  - parentData
  - parentDataProperty
  - rootData
  - etc.

Custom keyword "validate" function:
- schema
- data
- an object with properties:
  - schema
  - data
  - parentSchema
  - dataPath
  - parentData
  - parentDataProperty
  - rootData
  - etc.

Pros:
- these signatures will still allow one or two positional arguments in the most common cases
- other arguments can be used in any order using destructuring
- easy to extend and no need to remember the order

Cons:
- some performance impact (constructing objects and destructuring), although the most performant custom keywords ("inline" and "macro") will not be affected
- uglier code in Ajv itself (it will remain ES5 compatible, so no destructuring inside Ajv)

Questions:
- Should objects contain positional arguments as well (as above) or only the properties that are not available as positional arguments?