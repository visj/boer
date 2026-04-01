# [504] reduce probability of name-space collisions

**Problem**
Ajv compiles schemas into a single function (for performance) so variable names share the same name-space. While variable names in the different schema levels include level number, variables in different siblings (e.g. different properties) can have the same name and if they are not properly initialised it may cause wrong results (when the value from the previous sibling is used). #502 was the latest bug caused by this problem.

**Solution**
Use suffix for variable names that would include sibling names/numbers from all schema levels (in addition to schema level).

