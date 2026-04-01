# [1430] How to combine custom validation with JSON API Schema?

So I am obviously using AJV with a custom schema to check data that comes in via our API.

I am using the JSON API schema  to deifne how data should be structured, and I've built my custom validation schema around that structure (needing the top level `data` object, a `type` string etc) but I'd like to combine the JSON API Schema with my custom one.

Ideally meaning I would only have to write the schema for the attributes (and relationships if they exist) and have the JSON API schema handle everything else.

Is that possible? If so, can I get some insight on how to achieve that?