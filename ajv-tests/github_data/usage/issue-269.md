# [269] $data usage returns an error when trying to compare minimum value

Hi,

I've tried the following example taken from:
https://github.com/json-schema/json-schema/wiki/%24data-(v5-proposal)

``` json
{
    "type": "object",
    "properties": {
        "smaller": {"type": "number"},
        "larger": {
            "type": "number",
            "minimum": {"$data": "1/smaller"},
            "exclusiveMinimum": true
        }
    },
    "required": ["larger", "smaller"]
}
```

I wrote a simple json example:

``` javascript
{
  smaller: 6,
  larger: 8
}
```

Unfortunately I got the following error:
data.properties['larger'].minimum should be number

Can someone assist me with this issue?

Thank you very much,

Gilad
