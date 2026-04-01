# [2053] regex for Emoji script unicode not working

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
const schema = {
  body: {
    type: "object",
    properties: {
      emoji: {
        type: "string",
        pattern: "^\p{Emoji}$",
      },
    },
  },
};
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "emoji": "😜"
}
```

Regex test: https://regex101.com/r/ZEU1fo/1

I assume it has something to do with the `\p`? I believe that I just can't figure out how to write it the right way.