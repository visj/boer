# [676] $ref for keys

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`6.0.1`


**Ajv options object**

```javascript
/* using defaults */
```


**JSON Schema**

```json
{
  "type": "object",
  "properties": {
    "$my-key-ref": {
      "type": "object"
    }
  }
}
```


**Sample data**

```json
{
  "hello": {
    "foo": true
  }
}
```

I wasn't sure where to bring this up, but I'm trying to find out if something like this is possible, either via JSON Schema spec, or possibly via ajv helpers.

I want to replace `$my-key-ref` with a value stored either in the current schema, or preferably in a different schema a la [definitions](https://github.com/epoberezkin/ajv#combining-schemas-with-ref). Is this something that I can do with existing tooling, or should I just preprocess/find-and-replace the schema prior to using it for validation?