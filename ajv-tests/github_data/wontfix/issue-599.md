# [599] migration to use schema with other formats

**What version of Ajv you are you using?**
newest

**What problem do you want to solve?**
I need to use JSON schema as the source to generate elasticsearch templates, and more complicated flatten a nested JSON schema and convert to SQL. There are more "conversions" I have needs for and would like to have the solution extendable.

**What do you think is the correct solution to problem?**
I would rather not build a solution from scratch. The solution would require a pre and post modules, for elasticsearch templates would only require removing extraneous fields and converting types. Flatten, and create SQL table script would require a pre-module to compile and remove extraneous fields and converting type, flatten, then transform to SQL format.

**Will you be able to implement it?**
Yes, but not quickly, and reproducing allot of what has already been done
