# [827] Feature Request: show which additionalProperties are invalid

I'm happy to send over a PR if you can point me in the right direction.

I regularly get the error `data should NOT have additionalProperties`, but it's difficult to debug unless ajv reports what that property was, e.g. `data should not have additional property "foo"`

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

6.5.2

**Ajv options object**
`{useDefaults: true}`

