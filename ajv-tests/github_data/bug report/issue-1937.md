# [1937] Issue with AJV on Docker

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
5.5.2

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json

```

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

'use strict';

var compileSchema = require('./compile')
  , resolve = require('./compile/resolve')
  , Cache = require('./cache')
  , SchemaObject = require('./compile/schema_obj')
  , stableStringify = require('fast-json-stable-stringify')
  , formats = require('./compile/formats')
  , rules = require('./compile/rules')
  , **$dataMetaSchema = require('./$data')**
  , patternGroups = require('./patternGroups')
  , util = require('./compile/util')
  , co = require('co');
```

**Validation result, data AFTER validation, error messages**

```
Cannot find module './$data'
```

**What results did you expect?**
After further investigation it appears during AJV installation it failed to create $data.js on Docker. We believe somewhere in the AJV code the $ character must be escaped when creating $data.js.

**Are you going to resolve the issue?**
