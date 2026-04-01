# [898] Failed url validation

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
6.6.1, yes


**Ajv options object**

<!-- See https://github.com/epoberezkin/ajv#options -->

```javascript
{ allErrors: true, removeAdditional: true }
```


**JSON Schema**

```javascript
{
  type: "object",
  properties: {
    link: { type: "string", format: "url" } 
  }
}
```


**Sample data**

```javascript
{
  link: "http://test.com?ref=text"
}
```

**Validation result, data AFTER validation, error messages**

```
 { keyword: "format", dataPath: ".link", schemaPath: "#/properties/link/format", message: "should match format "url"" }
```

**What results did you expect?**
The url should pass.
