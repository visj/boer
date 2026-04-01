# [628] URL format type runtime scales exponentially with tld length

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Version 5.4.0 - Yes

**Ajv options object**
No options

**Your code**
Save this to `index.js` and run `npm install ajv && node index.js` in the same folder

```javascript
const Ajv = require('ajv');

let testNum = 1;

function runTest(data, schema) {
    const startDate = new Date();
    
    const ajv = new Ajv();
    const validate = ajv.compile(schema);
    const valid = validate(data);

    const endDate = new Date();

    console.log(`test ${testNum++} complete. time taken: ${endDate.getTime() - startDate.getTime()}`);

    if (valid) {
        return 'ok';
    } else {
        return ajv.errors;
    }
}

const schemaToTest = {
    properties: {
        url: {
            type: 'string',
            format: 'url',
        },
    },
};

const longestTld = 40;
for (let i = 0; i < longestTld; i++) {
    let tld = '';
    for (let j = 0; j < i; j++) {
        tld += 'a';
    }
    const url = `http://www.valid.${tld}`;

    const data = {
        url,
    };
    console.log(runTest(data, schemaToTest));
}
```

**Validation result, data AFTER validation, error messages**

```
test 1 complete. time taken: 42
const Ajv = require('ajv');
null
test 2 complete. time taken: 12
null
test 3 complete. time taken: 9
ok
test 4 complete. time taken: 18
ok
test 5 complete. time taken: 6
ok
test 6 complete. time taken: 11
ok
test 7 complete. time taken: 7
ok
test 8 complete. time taken: 8
ok
test 9 complete. time taken: 10
ok
test 10 complete. time taken: 11
ok
test 11 complete. time taken: 9
ok
test 12 complete. time taken: 8
ok
test 13 complete. time taken: 5
ok
test 14 complete. time taken: 9
ok
test 15 complete. time taken: 4
ok
test 16 complete. time taken: 14
ok
test 17 complete. time taken: 9
ok
test 18 complete. time taken: 5
ok
test 19 complete. time taken: 7
ok
test 20 complete. time taken: 9
ok
test 21 complete. time taken: 12
ok
test 22 complete. time taken: 16
ok
test 23 complete. time taken: 30
ok
test 24 complete. time taken: 59
ok
test 25 complete. time taken: 97
ok
test 26 complete. time taken: 191
ok
test 27 complete. time taken: 371
ok
test 28 complete. time taken: 764
ok
test 29 complete. time taken: 1468
ok
test 30 complete. time taken: 2893
ok
test 31 complete. time taken: 5808
ok
test 32 complete. time taken: 11779
ok
test 33 complete. time taken: 23581
ok
// I killed the command here because the pattern was clear
```

**What results did you expect?**
Not exponential evaluation time.

**Are you going to resolve the issue?**
I could certainly take a look, but I ran into this while doing testing on a project I'm working on.
