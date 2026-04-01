# [823] Is it possible to make property optional required.

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
     "type":"object",
     "properties":{
          "a":{"type":"number"},
          "b":{"type":"number","description":"when a equals to 5 then b is required"}
      }
}
```