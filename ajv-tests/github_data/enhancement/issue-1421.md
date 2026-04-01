# [1421] Allow ":" in user defined keyword names to support names like 'meta:license' and 'meta:enum'

**What version of Ajv you are you using?**
7.0.4

**What problem do you want to solve?**
[jsonschema2md](https://github.com/adobe/jsonschema2md) allows the use of additional keywords such as `meta:enum` to supply descriptive information to enrich the generated documentation. Adobe use this `meta:*` pattern in their own schemas, for example [XDM](https://github.com/adobe/xdm).

Turning off strict mode allows these properties, but it would be nicer to be able to add these as user defined keywords while retaining strict validation for everything else. The regex currently used to validate new keyword names doesn't allow `:` characters.

**What do you think is the correct solution to problem?**
Change the `KEYWORD_NAME` regex used to validate keyword names to allow `:`, but not as the first character. Something like

`/^[a-z_$][a-z0-9_$-:]*$/i`

**Will you be able to implement it?**
Yes.
