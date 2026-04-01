# [2309] Smart compile functions using `JTDDataType`

**What version of Ajv you are you using?**
v8

**What problem do you want to solve?**
I want the `compileParser` function to be smarter (including `compileSerializer` too)

**What do you think is the correct solution to problem?**

Adding the following overload to the function:
```
compileParser<R = unknown, T = JTDDataType<R>>(schema: R): JTDParser<T>;
```

**Will you be able to implement it?**
Maybe, I leave for vacation July 22nd-Aug 15th. I may be able to get a PR done today/tomorrow, but won't be available until after Aug 15th to complete it.
