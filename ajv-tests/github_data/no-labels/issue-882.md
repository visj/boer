# [882] data option not known or not working.

Hello, 
again thanks for your help.

epoberezkin/ajv-cli does not know the data option

See this:
```
# npm install -g epoberezkin/ajv-cli
/usr/local/bin/ajv -> /usr/local/lib/node_modules/ajv-cli/index.js
+ ajv-cli@1.0.0
added 40 packages from 60 contributors in 4.461s
# grep -A 1 "'data'" /usr/local/lib/node_modules/ajv-cli/commands/options.js
#
```

If I install from jessedc/ajv-cli the option is know, but still I get an error message.

```
# npm install -g jessedc/ajv-cli
/usr/local/bin/ajv -> /usr/local/lib/node_modules/ajv-cli/index.js
+ ajv-cli@3.0.0
added 47 packages from 61 contributors in 5.264s
# grep -A 1 "'data'" /usr/local/lib/node_modules/ajv-cli/commands/options.js
    'data':             { type: 'boolean' },
    'all-errors':       { type: 'boolean' },
# ajv -s s.json -d i.json --data true
schema s.json is invalid
error: schema is invalid: data.properties['smaller'].maximum should be number
#
```

I am stuck here. For me it seems something is out of sync. An update of package.json might be missing.

I really appretiate your help here. Thank you.

s.json is
```
{
    "properties": {
        "smaller": {
        "type": "number",
        "maximum": { "$data": "1/larger" }
        },
        "larger": { "type": "number" }
    }
}
```

i.json is
```
{
    "smaller": 5,
    "larger": 7
}
```

Regards
Ralf