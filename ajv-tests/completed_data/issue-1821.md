# [1821] compileAsync causes infinite chain of requests when metaschema is specified

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? 8.8 
Does the issue happen if you use the latest version? yes**

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{
  loadSchema: async (url) => {
    if (url.startsWith("http://")) {
      url = "https://" + url.substring(7)
    }
    const ans = await (await fetch(url)).json()
    console.log(ans)
    return ans;
  }
}

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{ "$ref": "http://json-schema.org/draft-04/schema#", "$schema": "http://json-schema.org/draft-04/schema#" }
```

**Sample data**

The schema never finishes compiling

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const ajv = new Ajv(options)

async function compile() {
  await ajv.compileAsync(schema)
  console.log("Done compiling")
}


```
Here's a sandbox replicating the problem: https://runkit.com/yesennes/619429f6e904c40008bcc644

**Validation result, data AFTER validation, error messages**

```
The schema never finish compiling.
```

**What results did you expect?**
The schema to finish compiling.
**Are you going to resolve the issue?**
I can take a stab at it.
