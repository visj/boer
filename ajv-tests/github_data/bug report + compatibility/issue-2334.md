# [2334] Compiling JSON Schema generates code with Syntax Error: redeclaration of const schema1

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.12.0

**Ajv options object**
None

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

Please see the attached schema.json.txt file (rename to schema.json).

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "apiVersion": "v1",
    "kind": "Service",
    "metadata": {
        "name": "mysql",
        "namespace": "mysql",
    },
    "spec": {
        "clusterIP": "10.96.58.31",
        "clusterIPs": [
            "10.96.58.31"
        ],
        "internalTrafficPolicy": "Cluster",
        "ipFamilies": [
            "IPv4"
        ],
        "ipFamilyPolicy": "SingleStack",
        "ports": [
            {
                "name": "mysql",
                "port": 3306,
                "protocol": "TCP",
                "targetPort": 6446
            },
            {
                "name": "mysqlx",
                "port": 33060,
                "protocol": "TCP",
                "targetPort": 6448
            },
            {
                "name": "mysql-alternate",
                "port": 6446,
                "protocol": "TCP",
                "targetPort": 6446
            },
            {
                "name": "mysqlx-alternate",
                "port": 6448,
                "protocol": "TCP",
                "targetPort": 6448
            },
            {
                "name": "mysql-ro",
                "port": 6447,
                "protocol": "TCP",
                "targetPort": 6447
            },
            {
                "name": "mysqlx-ro",
                "port": 6449,
                "protocol": "TCP",
                "targetPort": 6449
            }
        ],
        "selector": {
            "component": "mysqlrouter",
            "mysql.oracle.com/cluster": "mysql",
            "tier": "mysql"
        },
        "sessionAffinity": "None",
        "type": "ClusterIP"
    },
}

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
I have a Nuxt 3/Vue.js 3 app that is making a Rest API call to the server to get a generated JSON schema for Kubernetes resource types (e.g., a Service).  When I try to compile the attached generated schema (while it is still a JavaScript object--not a string), I see two errors in the browser Dev Tool console immediately after the stringified schema output.

1. `Error compiling schema, function code: ` - see attached file generated.js.txt file for the function code of the error.
2. `SyntaxError: redeclaration of const schema1` - see attached DevToolsScreenshot.png file for the call stack.

Note that I tried putting a try/catch block around the compile() function call but it did no good (i.e., no error was thrown).

```javascript
    const ajv = new Ajv();
    // The contents of the attached file schema.txt came from this output
    console.log(JSON.stringify(schemaObject, null, 2));
    const validate = ajv.compile(schemaObject);
```

**Validation result, data AFTER validation, error messages**

The compile step fails 


**What results did you expect?**

I expected the compile to succeed.

**Are you going to resolve the issue?**

I have tested the JSON schema in several online tools and it appears to be valid so I am not sure how to resolve this issue but I would like to get it resolved.  Please tell me what I am doing wrong.

[schema.json.txt](https://github.com/ajv-validator/ajv/files/12775006/schema.json.txt)
[generated.js.txt](https://github.com/ajv-validator/ajv/files/12775007/generated.js.txt)
![DevToolsScreenshot](https://github.com/ajv-validator/ajv/assets/31662131/25ce99df-6244-4418-979c-6dc79c5a8fc7)
