# [557] Improve schema compilation performance for schemas with large strings (review regular expressions)

The following regular expression used in compiling the JSON-schema is vulnerable to ReDoS:
```js
 /if\s*\([^)]+\)\s*\{\s*\}(?!\s*else)/g
```
The slowdown is moderate: for 40.000 characters around 4 seconds matching time. However, I would still suggest one of the following: 
- remove the regex,
- anchor the regex,
- limit the number of characters that can be matched by the repetition,
- limit the input size.

If needed, I can provide an actual example showing the slowdown.