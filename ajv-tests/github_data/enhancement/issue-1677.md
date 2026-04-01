# [1677] Add tsd to better test type interfaces

**What problem do you want to solve?**

The way types are checked right now, they're almost like static assertions in the tests. This has a few problems:
1. went testing you just get typescript error before the test, instead of seeing them alongside other tests
2. A lot of them require assigning to an empty variable and then voiding it out, making the tests confusing
3. checking nuanced things like, A is assignable to expression, or A is exactly equal to expression are more cumbersome in the current format.

**What do you think is the correct solution to problem?**

[tsd](https://www.npmjs.com/package/tsd) is a library MS recommends to checking typing of a project. The only downside is it's one more dev dependency.

**Will you be able to implement it?**

I can, in the short I imagine just migrating the current spec/type tests into their own jtd folder. But I want to make sure this is desirable. Something like this may make testing breaking changes like switching nullable behavior easier to test.
