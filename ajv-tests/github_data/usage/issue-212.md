# [212] Compiled validators lack dataPath field

If I use a compiled validator and get an error, the `errors` object (associated with the validator function), has a `dataPath` field which has the value `[object Object]`. I suspect that it is being copied in the process of validation.

I also enjoyed having the `errorsText()` function to produce a helpful error message. Apparently, this feature is not afforded to compiled validation functions. That's unfortunate and unexpected (as compiled validator functions have the same needs as those invoked via the `ajv` instance method).

Finally, for thread safety purposes (since I would expected compiled functions to be reused by many threads), why not simply return an `errors` object instead of a boolean? 
