# [1403] Strict mode validation: property names in "required" should be present in the sibling "properties" object

```
{
    "type" : "object",
    "properties" : {
      "test": {
      	"type":"number"
      }
    },
    "required" : [
        "identifier",
        "features"
    ]
}


```
**What version of Ajv you are you using?**
7.0.3

**What problem do you want to solve?**
Optional strict mode addition to check that keys given in "required" must exist in the sibling "properties" definition.

**What do you think is the correct solution to problem?**
Pass an additional constructor option to validate that every key name given in "required" exists as an explicitly defined property in "properties" when using strict mode.

**Will you be able to implement it?**
Yes
