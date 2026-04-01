# [353] Suggestion. Coercing null's only for required properties.

First of all I thank you for your project!

I have a suggestion.
Often coerceTypes behavior is undesirable.
For example
```js
// SH1
var schema = {
  "properties": {
    "foo": { "type": "string" },
    "bar": { "type": "number" }
  }
};
var source = { "bar": null };
// Coerce to (current result):
//{ "bar": 0 }
```
It seems to me that it would be logical for such a result:
```js
// Coerce to (desired result):
{  }
```
**since property ```"bar"``` is optional**

Expected (and currently):
```js
// SH2
var schema = {
  "properties": {
    "foo": { "type": "string" },
    "bar": { "type": "number" }
  },
  "required": ["bar"]
};
var source = { "bar": null };
// Coerce to (current result):
//{ "bar": 0 }
```

What do you think about it? This is logical and would be very helpful in my case. Possible and other users such behavior would seem preferable.

More example (_problematically_):
```js
// SH3
var schema = {
  "properties": {
    "foo": { "type": "string" },
    "bar": { "type": ["number", "null"] }
  }
};
var source = { "bar": null };
// Coerce to:
//{ "bar": null }
```

It may need a separate option?

**Thank you!**