# [558] Reduce number of unnecessary error reporting for nested oneOf's

**What version of Ajv you are you using?**
5.2.2
**What problem do you want to solve?**
Reduce the amount of error reporting for nested oneOf's where the problem is at the leaf object.  Do not report errors at higher levels in the hierarchy if they aren't there.  Do not bubble problems up the hierarchy.  Too many errors are created if you bubble.  See issue https://github.com/epoberezkin/ajv/issues/556 for files.
**What do you think is the correct solution to problem?**
Report the error closest to the actual problem.
**Will you be able to implement it?**
Not soon.

