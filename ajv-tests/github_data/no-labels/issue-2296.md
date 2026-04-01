# [2296] Azure Pipelines schema error

@epoberezkin I am using `ajv-cli` but for the problem I have I want to think it is irrelevant that I use the cli.

Running:

> I get the url from:  https://www.schemastore.org/json/

```bash
curl "https://raw.githubusercontent.com/microsoft/azure-pipelines-vscode/master/service-schema.json" --output service-schema.json

ajv compile -s service-schema.json
```

Output:

```
schema service-schema.json is invalid
error: strict mode: unknown keyword: "deprecationMessage"
error: Invalid regular expression: /^[^\/~\^\: \[\]\\]+(\/[^\/~\^\: \[\]\\]+)*$/: Invalid escape
```