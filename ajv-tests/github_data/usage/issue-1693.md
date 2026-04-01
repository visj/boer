# [1693] $schema is not supported

I'm using ajv7 and trying to validate this schema
`{
    "$schema": "http://json-schema.org/draft/2019-09/schema#",
    "type": "object",
    "properties": {
        "title": {
            "type": "string",
            "title": "Title",
            "description": "Title of object."
        }
    }
}`
ajv complains with the error no schema with key or ref `http://json-schema.org/draft/2019-09/schema#`
I got the same error when replacing `http` with `https`