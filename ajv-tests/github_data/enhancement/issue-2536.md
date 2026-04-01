# [2536] Coerce types at the validator level

**What version of Ajv you are you using?**
8.11

**What problem do you want to solve?**
When using AJV in the context of an OpenAPI based web server, you have a complete schema system you would like to manage in as single AJV instance since a query parameter may have a schema in common with a JSON request body.

That said, you probably don't want to coerce types of JSON payloads (request body / response body) but you want to do so for parameters that comes in as strings only (related https://github.com/ajv-validator/ajv/issues/1031).

Currently, I had to workaround by coercing values myself which is probably not a good approach (see https://github.com/nfroidure/whook/blob/main/packages/whook/src/libs/validation.ts#L403-L460).

I could have 2 different Ajv instances : one for payload and another for parameter but it would increase memory footprint and API startup time. Also, building the project taking advantage of AJV compilation (https://github.com/nfroidure/whook/issues/118) would necessit to have 2 separated builds and increase the bundle size.

**What do you think is the correct solution to problem?**

Allow to pass an option to validators to enable/disable coercion would solve the problem.

**Will you be able to implement it?**

I'm not sur I have sufficient AJV code base knowledge to do so, but if you think that it can take a few day with some directions, I could give it a try.
