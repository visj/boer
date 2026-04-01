# [364] Support options.loadScheme in synchronous compile()

**What version of Ajv you are you using?**
4.9.1

**What problem do you want to solve?**
We are using Jenkins to monitor a repo which consists of some json schema and some test json. The json schema files contain references which should be using loadSchema for custom loading.
To use loadSchema, we have to use compileAsync(), but it's asynchronous, so the node process already exits and no results can be collected.

**What do you think is the correct solution to problem?**
Support loadSchema in compile().

**Will you be able to implement it?**
not capable enough :)

