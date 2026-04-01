# [113] Reference remote schema id

Hi,
This is more a question than an issue, please discard it if not appropriate.
I'm trying to validate a schema with $ref and I get:
Error: can't resolve reference link.schema from id http://api.reference/user.schema#

user.schema:
"id": "http://api.reference/user.schema",
....
"self":{
    "$ref":"link.schema"
}

link.schema:
{
  "id": "http://api.reference/link.schema",
  "type": "object",
  "properties": {
    "href": {
      "type": "string",
    },
  },
}

Are references defined with id fetched remotely ? Is there a way to test them with local files without changing the "id" ?
I would expect an http request to http://api.reference/link.schema when validating user.schema.

Thanks for any help
