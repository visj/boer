# [1193] timezone should be more strict according to the JSON-schema spec

The timezone of the `date-time` format is too lazy since https://github.com/epoberezkin/ajv/issues/1061 has been resolved.

According to [the JSON-schema specification](https://json-schema.org/draft/2019-09/json-schema-validation.html#rfc.section.7.3.1) about date-time : 
> Date and time format names are derived from RFC 3339, section 5.6. 

and thus according to [the RFC 3339](https://tools.ietf.org/html/rfc3339#section-5.6): 

>   time-numoffset  = ("+" / "-") time-hour ":" time-minute
>   time-offset     = "Z" / time-numoffset
>
>   full-date       = date-fullyear "-" date-month "-" date-mday
>   full-time       = partial-time time-offset
>
>   date-time       = full-date "T" full-time

particularly the `time-numoffset` does explicitly said that the format must include `:` and the `time-inute`

The thing that I am not sure of is the following part:

> The following profile of ISO 8601 [ISO8601] dates SHOULD be used in new protocols on the Internet

Does this mean that we need to follow ISO8601 or the subset defined after this phrase ?? 🤔 

Some searches about the subject:
- https://stackoverflow.com/questions/40369287/what-pattern-should-be-used-to-parse-rfc-3339-datetime-strings-in-java
- https://stackoverflow.com/questions/522251/whats-the-difference-between-iso-8601-and-rfc-3339-date-formats
- https://medium.com/easyread/understanding-about-rfc-3339-for-datetime-formatting-in-software-engineering-940aa5d5f68a


**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Every version since https://github.com/epoberezkin/ajv/issues/1061 has been resolved


**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "string",
  "format": "date-time"
}
```


**Sample data**

Should not be valid :
```json
"2020-04-21T18:00:00+0200"
```
```json
"2020-04-21T18:00:00+02"
```

Should be valid :
```json
"2020-04-21T18:00:00+02:00"
```


**Your code**

<!--
Please:
- make it as small as posssible to reproduce the issue
- use one of the usage patterns from https://github.com/epoberezkin/ajv#getting-started
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
const Ajv = require('ajv');

const schema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'string',
  format: 'date-time',
};

const data = '2020-04-21T18:00:00+0200';

var ajv = new Ajv();
var validate = ajv.compile(schema);
var valid = validate(data);
console.log(valid ? 'valid' : 'invalid'); // should output "invalid" but does output "valid"
if (!valid) console.log(validate.errors);

```


**Validation result, data AFTER validation, error messages**

```
valid
```

**What results did you expect?**

```
invalid
```


**Are you going to resolve the issue?**

I can if you agree with the process