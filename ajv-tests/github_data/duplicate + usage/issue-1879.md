# [1879] Possible memory leak in custom keywords

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports. For other issues please use:
- security vulnerability: https://tidelift.com/security)
- a new feature/improvement: https://ajv.js.org/contributing/#changes
- browser/compatibility issues: https://ajv.js.org/contributing/#compatibility
- JSON-Schema standard: https://ajv.js.org/contributing/#json-schema
- Ajv usage questions: https://gitter.im/ajv-validator/ajv
-->
I have a server that validates every request first. When my server has a high number of requests, heap usage goes up until I face memory leak error. This problem happens when I update AJV from 6 to 8 version. Here is a small sample of my code.
 
**What version of Ajv are you using?**

8.9.0

**Does the issue happen if you use the latest version?**

yes

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const ajv = new Ajv({
  allErrors: true,
  $data: true,
  strict: false
});
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

**package.json dependencies**

```javascript
 "ajv": "^8.9.0",
    "ajv-errors": "^3.0.0",
    "ajv-formats": "^2.1.1",
    "ajv-keywords": "^5.1.0",
    "axios": "^0.24.0",
    "express": "^4.17.2"
```

**myAjv.js**
```javascript
const regex = {
  username: /^[a-z][a-z0-9_.]{3,24}$/i,
  password: /^[\w,\s!@#$%&?^*_~ "'][\w,\s!@#$%&?^*_~ "'\u0600-\u06FF]/
};
const Ajv = require('ajv');
const ajv = new Ajv({
  allErrors: true,
  $data: true,
  strict: false
});
require('ajv-errors')(ajv);
require('ajv-keywords')(ajv);
require("ajv-formats")(ajv);

ajv.addKeyword({
  keyword: 'username',
  compile: function (sch, parentSchema) {
    return function validate(data) {
      if (typeof data !== 'string' || !regex.username.test(data)) {
        if (!validate.errors) {
          validate.errors = [];
        }
        validate.errors.push({
          keyword: 'username',
          params: { keyword: 'username' },
          message: ({}).hasOwnProperty.call(parentSchema, 'errorMessages') && parentSchema.errorMessages.username ||
            'invalid username!!'
        });
        return false;
      }
      return true;
    };
  },
  errors: true
});

module.exports = ajv;
```
**myServer.js**

```javascript
const express = require('express');
const ajv = require('./myAjv');
const app = express();
const port = 3000;
app.use(express.json());

let schema = {
  'username': [],
  'errorMessages': {
    'username': 'invalid username'
  },
};

const fs = require('fs');
const path = __dirname + '/out1.tsv';
fs.writeFileSync(path, '\tHeapUsed\r\n', 'utf8');

app.post('/ajv', (req, res) => {
  try {
    ajv.validate(schema, req.body.data);
    fs.appendFileSync(path, `\t${Math.ceil(process.memoryUsage().heapUsed / 1024)} KB\r\n`);
    res.send('done!')
  } catch (err) {
    console.log(err);
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
```

**myScript.js**

```javascript
const axios = require('axios')
const startTime = new Date().getTime();

const data = {
  'myPassword': 'shahab@redis555'
};



function run() {
  axios.post('http://localhost:3000/ajv', data)
    .then(function (response) {
      console.log(response.data);
      if (new Date().getTime() - startTime > 0.2 * 60 * 60 * 1000) {
        clearInterval(interval);
        return;
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

let interval = setInterval(run, 10)

```
**result**

```
HeapUsed
	13533 KB
	13814 KB
	11277 KB
	7701 KB
	7826 KB
	7950 KB
	8114 KB
	8236 KB
	8428 KB
	8546 KB
	8737 KB
	8931 KB
	9049 KB
	9239 KB
	9355 KB
	9470 KB
	9587 KB
	9779 KB
	9894 KB
	10009 KB
	10125 KB
	10315 KB
	10431 KB
	10619 KB
	10809 KB
	10995 KB
	11110 KB
	11223 KB
	11410 KB
	11525 KB
	11640 KB
	11826 KB
	12012 KB
	12126 KB
	12313 KB
	12498 KB
	12683 KB
	12872 KB
	13058 KB
	13173 KB
	13358 KB
	13542 KB
	13730 KB
	13849 KB
	13962 KB
	14080 KB
	14195 KB
	14309 KB
	14423 KB
	14536 KB
	14659 KB
	14847 KB
	15035 KB
	15220 KB
	9042 KB
	9157 KB
	9343 KB
	9527 KB
	9642 KB
	9755 KB
	9941 KB
	10056 KB
	10170 KB
	10356 KB
	10552 KB
	10737 KB
	10851 KB
	11036 KB
	11221 KB
.
.
.
        124413 KB
	124570 KB
	124727 KB
	124826 KB
	124922 KB
	125080 KB
	125237 KB
	125393 KB
	125550 KB
	125648 KB
	125744 KB
	125902 KB
	126059 KB
	126155 KB
	126252 KB

```

**What results did you expect?**

heap usage stayed more stable. I also repeat this test with ajv@6 and there was no problem(everything was normal)

**Are you going to resolve the issue?**

No sry!!