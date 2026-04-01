# [274] Add assert method

Should have the same signature as `validate()`, but instead of returning a boolean, throw an error when the validation failed. This could be used both in APIs (with a custom error handler) and in API tests and would reduce boilerplate code. The error class should be accessible for `instanceof` checks and should have the `errors` property to get details about the failure. The `message` should be set to the return of `errorsText()`.
