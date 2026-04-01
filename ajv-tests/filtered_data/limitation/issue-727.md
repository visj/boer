# [727] "uniqueItems" limitations caused by performance optimisation

**Affected versions**
6.x.x only, <= 5.x.x is ok

**Problem**
"uniqueItems" when item "type" is specified as array of types in "items" schema will coerce all items to string before comparison (so `"5"` will be considered equal to `5`, etc.). If one of allowed types in the list is "array" or "object", uniqueItems simply won't work correctly, as all objects will be coerced as well and considered equal.

**Solution**
Make generated code dependent on the list of allowed types.

Related to #725

