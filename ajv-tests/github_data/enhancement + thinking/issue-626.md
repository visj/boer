# [626] Feature Request: add option to set smart defaults

Currently the values of `useDefaults` are as follow:

1. `false`, default. Simply doesn't set default values to validated objects.
2. `true`. Set a copy of default values on the data during validation.
3. `"shared"`. Set the default values on the data during validation, as a shared reference to the schema value (if object/array).

I'd like to add another enum here: `"smart"` (or similar). It would:
1. if no default value is set, force the default of every non-required field to be `undefined`,
1. create empty array/objects for fields that have them,
1. imply `useDefaults: true` which means that if a value is not defined in the object (and its default is missing from the schema), it will actually be set to `undefined`.

This solves a problem to us in Schematics; our EJS templates uses `with() {}` which requires values to exists (even if undefined), otherwise an exception is thrown. Having them set to `undefined` allows us to check their existence in the templates, and being able to list them with `Object.keys()` has some nice properties as well. Having arrays and objects also allow us to use values without checking if they exist first (ie. `if (a.b.c.length)` instead of `if (a && a.b && a.b.c && a.b.c.length)`).

I've already made a PR that passes all the tests (and added new tests): #627

I could also add a `smart-shared` option if you see value to it.