# [560] Is there a way to validate and make sure at least one field exists?

```
const validate = this.ajv.compile({
      properties: {
         id : {type: "string"}
        a: { type: "string"}
        b: { type: "string"}
      },
      required: [ "id " ],
      type: "object"
    });
```
This schema will ensure id exist. Can I further reinforce at least `a` or `b` exist?

Valid `{id : "1", a : "hi"} {id : "1", b : "hey"} {id : "1", a : "hi", b : "hey"}`
Invalid `{a : "hi"} {id: "1"} { } {b :"hey"}`