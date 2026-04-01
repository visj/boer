# [2514] Consistency of validation error messages

**What version of Ajv you are you using?**

v8.17.1

**What problem do you want to solve?**

It may be better to keep error messages consistent in terms of expression/format. More specifically, I found a minor issue that properties in dependency errors are not enclosed with quotes (like `must have properties X when property Y is present`) while required properties are enclosed like `must have property 'X'`.

**What do you think is the correct solution to problem?**

Enclose properties with quotes in the case of dependency errors.

**Will you be able to implement it?**

I plan to make a PR.
