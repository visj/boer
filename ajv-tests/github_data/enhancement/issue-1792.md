# [1792] Implement a JSONDataType to make typescript conversion on json schema

**What version of Ajv you are you using?**
8.6.4
**What problem do you want to solve?**
I want to dynamically infer ts types from a json schema, it will reduce the need for auto-generated file or code-duplication (define your interface 2 times, one for ts, one for ajv) 
**What do you think is the correct solution to problem?**
Implement a type mapper like in JTDDataType from 'ajv/dist/jtd', and update readme/doc accordingly
**Will you be able to implement it?**
Yes