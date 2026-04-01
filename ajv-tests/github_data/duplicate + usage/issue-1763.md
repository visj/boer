# [1763] Possible compile/validate memory leak

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

This is a stripped down version of https://github.com/stoplightio/prism/issues/1881

**What version of Ajv are you using?**
8.6.3

**Does the issue happen if you use the latest version?**
Yes

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
const ajv = new Ajv({
  allErrors: true,
  allowUnionTypes: true,
  allowMatchingProperties: true,
  strict: false,
});
```


**Your code**

**package.json**
```javascript
{
  "name": "repro",
  "engines": {
    "node": "^14.12"
  },
  "dependencies": {
    "ajv": "^8.6.3",
    "ajv-formats": "^2.1.1"
  }
}
```
**leak.js**
```javascript
const fs = require('fs');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Run me with `node --expose-gc ./leak.js`

const path = __dirname + '/out.tsv';
fs.writeFileSync(path, 'i\tHeapUsed\r\n', 'utf8');

const ajv = new Ajv({
  allErrors: true,
  allowUnionTypes: true,
  allowMatchingProperties: true,
  strict: false,
});

addFormats(ajv);

global.gc();

for (let i = 0; i < 1000; i++) {
  const validate = ajv.compile({ type: 'string', format: 'something', maxLength: 50 });
  const valid = validate('test');

  if (i % 10 === 0) {
    const mem = process.memoryUsage();
    global.gc();
    fs.appendFileSync(path, `${i}\t${mem.heapUsed}\r\n`);
  }
}

console.log();

const content = fs.readFileSync(path, 'utf8');
console.log(content);
```

**This generates the following output:**
```bash
$ node --expose-gc ./leak.js
unknown format "something" ignored in schema at path "#"
unknown format "something" ignored in schema at path "#"
unknown format "something" ignored in schema at path "#"
[...snipped..]
unknown format "something" ignored in schema at path "#"
unknown format "something" ignored in schema at path "#"
unknown format "something" ignored in schema at path "#"

i       HeapUsed
0       5767448
10      4623544
20      4646640
30      4681528
40      4719808
50      4756608
60      4794304
70      4841800
80      4873264
90      4909592
100     4941032
110     4975040
120     5008912
130     5066304
140     5090584
150     5124328
160     5167144
170     5200720
180     5238032
190     5295016
200     5303672
210     5337112
220     5376416
230     5414560
240     5446520
250     5751672
260     5813184
270     5826432
280     5862232
290     5896072
300     5929912
310     5965824
320     6008208
330     6031712
340     6081408
350     6106024
360     6154208
370     6180048
380     6212784
390     6246624
400     6319240
410     6320728
420     6354888
430     6382672
440     6416912
450     6455400
460     6484240
470     6518080
480     6554208
490     6587688
500     6632048
510     6717888
520     6747848
530     6767904
540     6804768
550     6842680
560     6898664
570     6930016
580     6966856
590     6990728
600     7044992
610     7106160
620     7105360
630     7130064
640     7163904
650     7197744
660     7237784
670     7265424
680     7292952
690     7338512
700     7366944
710     7405032
720     7435336
730     7469792
740     7511088
750     7536856
760     7571160
770     7605000
780     7638840
790     7672680
800     7714096
810     7750264
820     7809272
830     7813784
840     7844912
850     7912256
860     7918792
870     7958696
880     7985296
890     8019136
900     8061376
910     8086816
920     8152240
930     8190112
940     8195240
950     8247840
960     8281680
970     8315056
980     8355120
990     8396344
```

Although, the garbage collector is regularly triggered, the amount of used heap keeps on growing.

**What results did you expect?**

I would expect the heap to stay more or less stable.

**Are you going to resolve the issue?**

Sorry, I don't have the required skills. :-(