# [2270] Validate schema itself without data

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv you are you using?**
5.0.0
**What problem do you want to solve?**
I am writing a schema `myschema.schema.json` using the draft 2020-12 and I would like to validate that the schema is correct. The only way I see to validate it is to create some data for the schema (`data.json`) and run the command:

```shell
> ajv --spec=draft2020 -s myschema.schema.json -d data.json
```

However I'm not interested in validating `data.json` but in validating that `myschema.schema.json` is a valid 2020-12 JSON schema. 

**What do you think is the correct solution to problem?**

Ideally I would expect that if you run the command: 

```shell
> ajv --spec=draft2020 -d myschema.schema.json
```

Then `-s` is not required as it is assumed to be the `draft2020`. 

**Will you be able to implement it?**

I don't have much time to implement it so only if it's simple.
