# [2009] Warning when using 'object' type for 'format' keyword and 'date-time' format

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.0

**Ajv options object**

```javascript
{ coerceTypes: true }
```

**Schema**

```javascript
const schema = {
  type: "object",
  properties: {
    date: {type: "object", format: "date-time"},
  },
  required: ["date"],
  additionalProperties: true,
};

```
Hello,

I'm trying to use ajv-formats 2.1.1 to parse Date objects, but I'm getting the following warning: `strict mode: missing type "number,string" for keyword "format" at "#/properties/date" (strictTypes)`

The warning disappears when settings strictTypes to false, but I wouldn't like to do so. Is there a way to remove the warning?

Thanks in advance.
