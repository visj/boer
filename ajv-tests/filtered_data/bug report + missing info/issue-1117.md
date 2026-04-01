# [1117] String integer converts to null if type is ['integer', 'null']

**What version of Ajv are you using? **
6.10.2

If schema is set to ['integer', 'null']:
```
var schema =  {
    $id: 'posIntNull',
    type: ['integer', 'null'],
    minimum: 1
},
```
And you have bigint integer with type of string '2312312', then string integer converts into null, instead of integer 2312312.

If schema is set to 'integer', than it's works fine.
