# [1051] removeKeyword required and loopRequired option


**What results did you expect?**

Observed
removeKeyword('required') does not work without a change to loopRequired option
Expected
removeKeyword('required') should work without setting additional options

Observed
loopRequired option cannot be set to 0 (it is falsy in Ajv constructor), it can however be set to -1
Expected
can set loopRequired to 0

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
    "ajv": "^6.10.0",
logic is same in HEAD

**Code Sections Combined Heading**

```javascript

// FAIL
it("remove keyword required", async () => {
  const validator = new Ajv().removeKeyword("required");
  const valid = validator.validate(
    {
      type: "object",
      properties: {
        name: { type: "string" }
      },
      required: ["name"]
    },
    {}
  );
  expect(valid).toBe(true); // <-- false
  expect(validator.errors).toBeNull(); // <-- should have required property 'name'
});

// PASS
it("remove keyword required on ajv validator", async () => {
  const validator = new Ajv({
    loopRequired: -1  // <-------------- THIS WAS ADDED
  }).removeKeyword("required");
  const valid = validator.validate(
    {
      type: "object",
      properties: {
        name: { type: "string" }
      },
      required: ["name"]
    },
    {}
  );
  expect(valid).toBe(true);
  expect(validator.errors).toBeNull();
});

```

```javascript
// PATCH
// lib/ajv.js:66
  opts.loopRequired = opts.loopRequired || Infinity;
// can be instead?
  if (opts.loopRequired === undefined) opts.loopRequired = Infinity;
```

**Are you going to resolve the issue?**

I can submit above patch as a pull request if it is correct.

I am unsure of the fix for making it work without loopRequired option, and will not be able to make this change. (Perhaps reassign Ajv.prototype.removeKeyword to a function that wraps its current definition?)

I am open to update the documentation once the expected behaviour is confirmed.
