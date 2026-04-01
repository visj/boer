# [2186] schemaPath is different between AWS Lambda and local execution

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for compatibility issues.
For other issues please see https://ajv.js.org/contributing/
-->

**The version of Ajv you are using**
8.11.0

**The environment you have the problem with**
AWS Lambda

**description**

when validating invalid data 

**Results in node.js v8+**
also occurs with `sam local invoke`
```
,"errors":[{
    "instancePath":"/join_ts",
    "schemaPath":"depot:com.<redacted>/analytics/user_ctx/2-0-0/properties/join_ts/format",
    "keyword":"format",
    "params":{"format":"date-time"},
    "message":"must match format \"date-time\""
}]
```

**Results and error messages in your platform**

```
  "errors": [
        {
          "instancePath": "/join_ts",
          "schemaPath": "#/properties/join_ts/format",
          "keyword": "format",
          "params": {
            "format": "date-time"
          },
          "message": "must match format \"date-time\""
        }
      ]
```
