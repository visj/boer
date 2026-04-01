# [2354] Standalone esm option `--code-esm` is not recognized



**What version of Ajv are you using? Does the issue happen if you use the latest version?**

ajv-cli@5.0.0



The docs say:

> pass the --code-esm (CLI) flag if you want ESM exported code.

But when I do this:

```
ajv compile -s numeric.json --code-esm -o validate_schema.js
```

It gives this error:

```
error: parameter --code-esm is unknown
```

Indeed, in `ajv help compile`, there is no option listed for `--code.esm`. So, the documentation here is incorrect: https://ajv.js.org/standalone.html


Maybe related to #2209 -- is ESM module generation not working, and so the CLI option has been removed?