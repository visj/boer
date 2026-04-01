# [2511] Ajv validator test in jest

I am trying to test my `Ajv` schema validator using `jest`. Let my schema be `userSchema`, I then have
```
const UserSchema = ajv.compile(userSchema)
```
In the application this works fine, if it is passed an invalid schema then `UserSchema` will throw a `ValidationError`. This is as expected since I have some validation keywords which are async in `userSchema`. Now, I want to create a test that checks that valid and invalid data are validated appropriately. I expect to have the data available if the validation succeeds, so to test valid data I use
```
test('check valid data', async () => {
  expect(await UserSchema(user)).toBeTruthy();
}) 
```
and this works. However, for testing invalid data I keep running into issues. I am using
```
test('check invalid data', async () => {
  expect(async () => {await UserSchema(user);}).toThrow(ValidationError);
})
```
but this does not work. When I run the test, it gives `Received function did not throw` and `Test suite failed to run` as two separate errors. The second is a result of `validation failed` which comes from running `await UserSchema(user)` - coincidentally this is the message given when a `ValidationError` is thrown and also can be seen when testing manually.

I don't understand why this test does not run as it should. The compiled schema definitely throws a `ValidationError` I have tested this manually in my API by including a `console.log(error instanceof ValidationError)` as the first statement in the catch block after calling `UserSchema`. As expected, when testing manually and passing invalid data this logs `true`.