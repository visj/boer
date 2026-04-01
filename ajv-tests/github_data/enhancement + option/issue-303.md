# [303] Have a way to disable the extendRefs warning

**What version of Ajv you are you using?** 4.7.2
**What problem do you want to solve?** extendRefs warning about issue #260 is quite noisy.
**What do you think is the correct solution to problem?** Add a way to disable it.
**Will you be able to implement it?** Probably.

I'm working with an upstream schema that has $refs extended with additional keywords. I have extendRefs set to `true` and my log is now full of lines like this:

```
$ref: all keywords used in schema at path '.rule[' + i2 + ']' (it will change in the next major version, see issue #260)
```

Right now I'm working around it by setting console.log to a no-op while calling `ajv.compile`, but I'd prefer to have a configuration option to do it.
