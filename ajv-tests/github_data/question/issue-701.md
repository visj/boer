# [701] Pre-validating Json-Patches...

**What version of Ajv you are you using?**
6.1.1

**What problem do you want to solve?**
When doing a database update operation on Google Datastore, I need to start a transaction, get the document, patch it with JSON-Patch (sent from the clientside), validate the result, and if it's correct, save it.

This is very wasteful in the case when the change is invalid. I need some way to spot clearly invalid changes in advance, so I can return an error without ever reaching for the db.

**What do you think is the correct solution to problem?**
I'd like to create some kind of JSON-Patch validator that checks for changes to "readOnly" properties, and validates the fields that are set to a new value. This won't catch all invalid changes, but it's still going to save time and money.

Since ajv is already reading and compiling my Schemas, I'm hoping for some guidance if I can somehow hook into the plumbing of ajv so I don't reimplement too many things.

**Will you be able to implement it?**
Hope so. :)