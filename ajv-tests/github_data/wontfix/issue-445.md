# [445] Using async validators with allErrors:true does not run in parallel

I'm using { allErrors: true} with an async schema with async keywords.

(Side note: the reason I'm using allErrors: true is because I actually want to validate individual fields at runtime -- like I click off of a field on the UI and it runs the validation -- but I won't be able to get a specific field's errors back unless I run allErrors: true... correct? Is there a better way to do that?)

I noticed that the async keywords run sequentially and wait for the result of the previous one to finish, leading to a performance issue if you have multiple async validators that are waiting on some external resource.


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
4.4..0 (issue still occurs in beta version)

**Ajv options object (see https://github.com/epoberezkin/ajv#options):**

```javascript
{ allErrors: true }
```

**JSON Schema (please make it as small as possible to reproduce the issue):**

```json
{
  "$async": true,
  "title": "User Schema",
  "type": "object",
  "properties": {
    "firstName": {
      "description": "First Name",
      "type": "string",
      "nameBlacklist": true
    },
    "lastName": {
      "description": "Last Name",
      "type": "string",
      "nameBlacklist": true
    }
  }
}
```


**Data (please make it as small as posssible to reproduce the issue):**

```json
{
  "firstName": "Paul",
  "lastName": "Paul"
}
```

**Your code (please use `options`, `schema` and `data` as variables):**

https://runkit.com/58d3cd89ae69180014e71b26/58d3cd89ae69180014e71b27

**What results did you expect?**
Expected time to take ~1000ms (running async keywords in parallel).

Actual time is ~2000ms (indicating sequential execution of keywords)

**Are you going to resolve the issue?**
If it is determined to be valid, then yes I can.