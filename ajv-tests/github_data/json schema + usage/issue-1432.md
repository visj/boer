# [1432] $schema keyword not supported

Simple, I can't use `$schema`:
```json
{
  "$id": "...",
  "$schema": "http://json-schema.org/draft/2019-09/schema#",
  "title": "Event",
  "type": "object",
  "properties": {}
}
```
Error:
```
  message: 'no schema with key or ref "http://json-schema.org/draft/2019-09/schema#"',
```
ajv@6.12.4

https://json-schema.org/understanding-json-schema/reference/schema.html