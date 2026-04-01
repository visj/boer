# [2220] validating and coercing comma separated values

**What version of Ajv you are you using?**

8.12.0

**What problem do you want to solve?**

Elegant validation and coercion of query parameters with comma separated values or other serialization rules.

Ok, I realize that this is probably a long shot and maybe not in the scope of ajv, but I still think the use-case is interesting and maybe somebody has something useful to reply.

I use query parameters serialized using open-api rules (https://swagger.io/docs/specification/serialization/), then in an express server I use ajv to validate the query parameters and coerce them. To do this I create a schema to match req.query that also serves as a type guard for a matching typescript Type. This way I get validation, coercion and type guarding in a single step in ajv based on the initial query-string parsing performed by express. This works great for simple types, but for arrays in non-exploded format (?param=val1,val2) not so much.

**What do you think is the correct solution to problem?**

I see a few options:
  - Outside of ajv scope, use a parameterized query parser that interprets open api parameter definitions and fills req.query accordingly. This seems like a pretty natural thing to do but I haven't found the right module for it yet and there would be a lot of overlap with what ajv does pretty well already.
  - Add a custom keyword (maybe stringCoercion) to JSON schema (probably an object whose content would closely match open api vocabulary: form, explode, spaceDelimited, etc) and use these rules in ajv to perform advanced coercion from string to array.
  - same as the previous one but done in a plugin

**Will you be able to implement it?**

I might be able to implement a plugin, but I don't know if ajv is extensible enough to do it properly. Can a user-defined keyword be used to extend type coercion ?

Also I might implement it as a separate tool complementary with ajv instead of a plugin, but I wanted to try and get some feedback here first.