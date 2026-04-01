# [1042] removeAdditional: 'all' removes properties not defined in "if" schema

When using `removeAdditional: 'all'` with `if/then/else` i get an error that something is missing, even when it doesn't.

I assume this happens because in the if i doesn't have all props defined.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest. 

**Steps to reproduce**

Here's Runkit that shows the behavior.

https://runkit.com/kristijanhusak/5d288ce4386251001b01d737

When `removeAdditional` is removed, everything works fine.

**What results did you expect?**
I would expect validation to pass

**Are you going to resolve the issue?**
Probably not.