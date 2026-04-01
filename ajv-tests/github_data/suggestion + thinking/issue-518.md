# [518] Letting custom keywords work both as sync and async

**What version of Ajv you are you using?**

Testing in 5.1.5.

**What problem do you want to solve?**

I am defining a custom keyword that does a validation-time `$ref` invocation and passes back the validation result and/or errors from the inner schema. Depending on the inner schema, it may receive actual values, or only a promise. (Even in an async schema, the inner schema may only involve sync keywords.)

Currently, custom keywords defined with a validation function or a compilation function can respond with a promise only if they were marked as `{ async: true }` in their definition. (I think this would not be an issue for inline functions, because, if they don't short-circuit, both sync and async keywords report errors in the same way. I think it would not matter for macro keywords either, due to how they are defined.) The function itself can attempt to respond with a promise, but it will just be ignored and treated as truthy.

One way to get around this, is to define two keywords, with the exact same rule definitions, except that one of them gets `{ async: true }`.

For keywords that are not async because of themselves, but only what schemas may be under them, it would be nice to have the exact same keyword.

**What do you think is the correct solution to problem?**

The code at https://github.com/epoberezkin/ajv/blob/master/lib/dot/custom.jst#L114-L131 can be slightly adapted to test (only when `it.async && !$asyncKeyword`) whether the return value is a boolean. If it is, then everything works as usual. If it is not, then it is (likely) a promise and so `{{=$valid}} = {{=it.yieldAwait}} {{=$valid}}` turns it into the result (or a thrown error), and we act accordingly.

Well, not quite: this assumes only booleans or promises would be returned from a validation function. (I test for booleans rather than promises, in order not to complicate interactions with transpilers or different environments.) If that is too risky, we could test for being an object with a `then` property, which is not perfect either...

**Will you be able to implement it?**

I already have an implementation of it and it passes all existing tests. I also have some additional tests that, at least so far, suggest it really is doing what I wanted.

I'd also need to invent some tests for the interaction with `{ allErrors: true }`, just because it could hold surprises.

I don't know if specific tests would be needed for interaction with different async solutions or the fact that it didn't break any current test is sufficient.

I guess the question is more whether this would be an acceptable addition, in part because it seems there's some work going on about the async details.