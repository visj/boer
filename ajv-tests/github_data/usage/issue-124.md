# [124] required field Question

For e.g., we have a schema as following

``` javascript
{
    "type": "object",
    "properties": {
        "user": {
             "$ref": "/another_schema"
        }
    },
    "required": [
        "user"
    ]
}
```

When validate against following payloads,

```
{
    "user": {
        "user_id": null
        "user_name": null
    }
}
```

```
{
    "user": {}
}
```

It would throw required `user is a required property`
Is there any setting to let the payload pass as it is keeping the required structure `"user"`?
