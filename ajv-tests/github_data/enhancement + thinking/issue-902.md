# [902] [REQUEST] Function to register a callback on a successful partial match

# Change proposal
I would like the ability to register a callback function that gets called whenever there is a successful partial match of a specific part of the schema to the data.   This would look something like this:
```js
ajv.on("JSON Pointer into Schema",function (schema, data, other...) {....});
```

## Additional information:

### Avj version: 6.5.4
### The problem: 
We are working on a W3C standard (see https://github.com/w3c/wot-thing-description) that requires an "implementation report" (see testing/report.html in that repo for a draft) that tallys what features are being used or not by a large number of JSON files.  Part of what makes this complicated is the fact that JSON Schemas are not official standards yet so we can't just provide the schema as a specification, but have to relate it to a bunch of prose assertions in the standard itself.   Each assertion defines a feature which is tested by some part of the schema.  What we want to do is match all our test files against a single (complex) schema and then use the callbacks to log which files are using what elements.  

### Alternative Not-Very-Good-At-All Solution
Our other option to solve our validation problem is to write a bunch of small schemas to test each feature separately but this has several problems: 
1. There are numerous subfeatures, so it would be a huge amount of work 
2. It would be a maintenance nightmare, as changes to the main schema would have to be propagated each subschema 
3. We actually need to know not only whether a given file passes or fails, but whether it uses a given feature.  In other words, the result we need is three-valued, not boolean.

### What do you think is the correct solution to problem?

#### Option 1: Callback
A callback that gets triggered for a partial match, as described above.   This could be an optional feature (eg needing to be turned on explicitly in the Options structure) to avoid slowing things down in the common case when it is not used.  Then a simple table-driven program could verify and report on all the subschemas in a single pass over each JSON file.

#### Option 2: Tabulated Results
It might also be possible to structure this like errors, logging results to an array that is accessed only after the validation is complete.  However, this would not be as flexible since it's unclear what data would need to be logged.  Obviously the location of the subschema and the validity of the match needs to be logged, and maybe the matching position in the data, both identified by a JSON pointer.  In this case a simple option to log ALL matches might be simplest; then the user would have to sort through the results to find what they want.  Alternatively, a set of sub-schema locations/ids could be given in an array (eg in an option) or via a set of function calls.

### Will you be able to implement it?
Maybe... we are looking through the code base now.   We may attempt it, as modifying ajv looks to be less work than all our other options.  But ideally if we do invest the time it would be nice to see it upstreamed.

We did try using a custom keyword to trigger a callback but it does not do what we want, since those callbacks get triggered before the subschema has finished validation, not after.  It would also be nice to support this without having to add custom keywords to the schema or otherwise modifying it (although we could live with that if we had to).
