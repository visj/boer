# [2466] Replace fast-deep-equal with dequal

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
8.16.0

**What problem do you want to solve?**
`dequal` is faster than `fast-deep-equal`: [benchmarks](https://github.com/lukeed/dequal?tab=readme-ov-file#benchmarks)

**What do you think is the correct solution to problem?**
```diff
-import deepEqual from 'fast-deep-equal'
+import { dequal } from 'dequal/lite'
```

**Will you be able to implement it?**
No