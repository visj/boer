# [2231] Using Ajv2019 and format does not seem to work with deno

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://ajv.js.org/contributing/
-->

**The version of Ajv you are using**

Latest available on npm (8.12.0)

**The environment you have the problem with**

Deno 1.31.1 (latest as of today)

**Your code (please make it as small as possible to reproduce the issue)**
I use the 'standard' idiom to for Ajv2019 and various formats with node+Typescript:

```
import Ajv2019, { ErrorObject} from 'ajv/dist/2019';
import addFormats from 'ajv-formats';
...
        const ajv = new Ajv2019({allErrors: true, verbose: true});
        addFormats(ajv);
```

and that works well. One would expect that with the latest version of deno (which can use npm directly), one could
simply say

```
import Ajv2019, { ErrorObject} from 'npm:ajv/dist/2019';
import addFormats from 'npm:ajv-formats';
```

but deno complains on not finding `dist/2019` and that `addFormat` cannot be used as function. I have tried other CDNs, but did not work. Note that the "default" Ajv access seems to work.

Is there any way to access Ajv2019?