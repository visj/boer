# [1404] Disallow properties not in schema

I can't seem to find anything about this in the documentation.

Is there a way to throw a validation error if a property not in the schema is present in the payload?

eg if `uuid` is "disallowed" and its present in the JSON being validated, it errors as invalid