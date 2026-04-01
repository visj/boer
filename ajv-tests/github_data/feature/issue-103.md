# [103] Any mechanism to clear the cache?

Is there any mechanism to clear ajv's cache?

I'm using multiple schemas that depend on a common "definitions" schema. The code goes like:

ajv.addSchema(definitionsSchema, 'def');
ajv.validate(schema1, object1);
ajv.validate(schema2, object2);
ajv.validate(schema3, object3);

everything is great until I'm trying to hot-plug the definitions:

ajv.removeSchema('def');
ajv.addSchema(definitionsSchema2, 'def');

ajv.validate(schema1, object1_for_definitions2);    // VALIDATION FAILS!!!

Because schemas are getting cached along with $ref's that link to now-defunct definitions file.
My debugging was able to pinpoint the problem to stale cache.

I'm aware of three ways to get around this problem:
1. Explicitly remove all schemas that I was using. This is a little ugly, because I will need to keep track of all of them;
2. Reinitialize entire Ajv. This is what I'm doing now, but it feels like an overkill;
3. Provide my own cache that has this capability. Also a bit of an overkill;

IMHO it would be nice to provide a way just to clear the ajv's cache.
