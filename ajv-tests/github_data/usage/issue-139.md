# [139] Is there a strict mode to decline extra data in JSON?

We see that extra data added outside the scope of the schema is allowed and passes `ajv` validation. Is there a way to block this?

Schema:

```
"actor_type": {
  "type": "array",
  "items": {
    "type": "object",
    "@template_id": "PCE-87549f5c-b38c-4dc1-ae90-c8a4f73d40eb",
    "properties": {
      "object_id": {
        "type": "string",
        "enum": [
          "*",
          "ADMIN"
        ]
},
```

JSON configuration:

```
{  
   "actor_type":[  
      {  
         "object_id":"ADMIN",
         "capability_group":{  
            "capability_sets":[  
               {  

               }
            ]
         },
         "capabilities_set":false,
         "operation_set":false
      }
   ]
}
```

It looks like the added values of `capability_group` and `capability_sets` are extra data that aren't in the JSON schema and pass `ajv` validation. Is there a flag or way around this to not allow extra data here?
