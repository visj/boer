# [1612] Why not use strict equals for const when the value on the right hand side isn't an object?

**What version of Ajv you are you using?**
8.2.0
**What problem do you want to solve?**
when using {const: true} the resulting codegen still pulls in deepequals and calls that function. This even happens when I do {const: true, type: "boolean"}
**What do you think is the correct solution to problem?**
I think if value of const is a literal and not an object, it would probably be better to use strict equality (===)
**Will you be able to implement it?**
Probably, I haven't dug around the code, but I am willing to put the time in.
