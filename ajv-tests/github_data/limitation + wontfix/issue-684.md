# [684] addKeyword does not get triggered

**What version of Ajv you are you using?**
6.0.1

**What problem do you want to solve?**

I'm creating a `default`-like keyword

```
ajv.addKeyword('defaultNow', {
        valid: true,
        modifying: true,
        validate: function(
            schema, data, parentSchema, currentDataPath, parent, name) {
console.log(name, parent[name]);
if (typeof(parent[name])=='undefined') {
console.log(" ** parent", parent, "name", name);
            parent[name]=Date.now();
console.log(" ** after: ", parent);
}
        },
    });
```

and schema is like

```
{
    "title": "myobj",
    "type": "object",
    "properties": {
        "created_at": {
            "type": "number", "defaultNow": true
        },
...
```

a missing created_at, would not call my custom keyword validator

**What do you think is the correct solution to problem?**

if a field is required it should be triggered

it seems that ajv only loops on exiting properties 

**Will you be able to implement it?**

not sure