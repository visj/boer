# [1077] Let string type take Date instance

**What version of Ajv you are you using?**

6.10.2

**What problem do you want to solve?**

When I use `{ type: 'string', format: 'date-time' }` to validate a `Date` instance it throws an error. There is no choice but convert all `Date` instances manually before validation with current implementation.

**What do you think is the correct solution to problem?**

Allow string type to take `Date` instances.

**Will you be able to implement it?**

Yes: https://github.com/Elethom/ajv/tree/enhancement/date-as-string