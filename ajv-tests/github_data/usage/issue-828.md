# [828] Reduced error messages returned from oneOf/anyOf

I'll start off with great tool! I've been converting all of our schema validation from another, much slower, package. The "problem" I have is that we use the error messages returned to display the error to our application's front end. The "issue" I have is that oneOf/anyOf combined with if/then returns all of the failed errors making it impossible to determine why it failed. 

I'm currently using 6.5.2

The follow example is hand typed because I'm on a disconnected network, so please excuse any typos:
```json
{
  "type": "array",
  "additionalProperties": false,
  "items": [
    {
      "type": "object",
      "additionalProperties": false,
      "properties": {
        "type": {
          "type": "string",
          "enum": ["circle","triangle","polygon"]
        },
        "points": {
          "type": "array",
          "items": points,
          "oneOf": [
            {
              "if": {"properties": {"type": {"enum": ["circle"]}}},
              "then": { "minItems": 1, "maxItems": 1 }
            },
            {
              "if": {"properties": {"type": {"enum": ["triangle"]}}},
              "then": {"minItems": 3,"maxItems": 3}
            },
            {
              "if": {"properties": {"type": {"enum": ["polygon"]}}},
              "then": { "minItems": 3 }
            }
          ]
        }
      }
    }
  ]
}
```
points are defined as a latitude and longitude. 
if I pass in json like this:
```json
[
  {
    "type": "triangle",
    "points": [{"lat":"1N", "long":"2E"}, {"lat":"2N","long":"3E"}],
  },
]
```
I get a lot of errors back:

```json
[
{ "path": "0.points", "type": "maxItems", "message: 'should NOT have more than 1 items" }
{ "path": "0.points", "type": "if", "message": "should match then schema" }
{ "path": "0.points", "type": "minItems", "message": "should NOT have less than 3 items" }
{ "path": "0.points", "type": "if", "message": "should match then schema" }
{ "path": "0.points", "type": "minItems", "message": "should NOT have less than 3 items" }
{ "path": "0.points", "type": "if", "message": "should match then schema" }
]
```
What I'd really like to get back is just:
```json
{ "path": "0.points", "type": "minItems", "message": "should NOT have less than 3 items" }
{ "path": "0.points", "type": "if", "message": "should match then schema" }
```

Is it possible to add a flag for this? Or is this something I missed that already exits?

