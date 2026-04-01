# [118] Reporting custom errors from asynchronous custom keywords

Related to #40

At the moment it should not be done because ajv expect those errors to be assigned to `.errors` property of the function itself and it may cause issues in case this function is asynchronous (the errors from subsequent calls may overwrite the errors from the previous call before they are used).

The possible solution is to allow that validation functions of custom async keywords throw an exception `Ajv.ValidationError` with `errors` property (in the same way as generated validation functions return results).

In this case it makes sense to allow that custom formats also behave in the same way - assign errors to the function in case it is synchronous and throw the exception in case they are asynchronous.

Since both custom formats and keywords will still be able to return promise that resolves to `false` (in which case Ajv will create standard errors) this change is backwards compatible.
