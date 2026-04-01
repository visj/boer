# [2156] Generate initial object state from the schema

Hey guys. I'm building a React library that consumes AJV Schema and I wonder if there is some internal method or a way to generate a sample object for the given schema.

E.g., given this schema

```js
{
    "type": "object",
    "properties": {
        "name": {
            "type": "string"
        }
    }
}
```

generate an object

```js
{
name: ""
}
```

In simple words, I'd like to generate an initial state of the form by simply looking at the schema. I find it redundant doing this manually, considering that the schema itself has all the necessary information. Do you happen to know if this is possible, and if not, is there some external library that would help me achieve this.

Thanks a bunch in advance. 