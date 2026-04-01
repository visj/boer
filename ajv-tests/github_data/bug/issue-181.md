# [181] Overriding default errors on custom keyword is not working

I am using version 4.0.5 <- there I defined the following keyword:

```
ajv.addKeyword("validateMaxPoints", {
  errors: true,
  async: false,
  validate: function(value, dataObject) {
    if (this.errors === null)
      this.errors = [];

    this.errors.push({
      keyword: "validateMaxPoints",
      message: "maxPoints attribute should be " + 0 + ", but is " + 0,
      params: {
        keyword: "validateMaxPoints"
      }
    });

    return false;
  }
});
```

I added _validateMaxPoints_ to the schema, compiled it and validated my data.

I expected to see my custom error object in the errors array, but instead I got:

```
{ keyword: "validateMaxPoints",
    dataPath: "",
    schemaPath: "#/validateMaxPoints",
    params: { keyword: "validateMaxPoints" },
    message: "should pass "validateMaxPoints" keyword validation",
    schema: true,
    parentSchema: 
     { type: "object",
       properties: [Object],
       required: [Object],
       validateMaxPoints: true },
    data: 
     { user: "112233445566778899101112",
       title: "title",
       timestamp: "Wed May 04 2016 12:26:24 GMT+0200 (CEST)",
       maxPoints: 10,
       type: "list",
       limit: "",
       questions: [Object] } }
```

Is this an error or did I missed something?
