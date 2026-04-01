# [1005]  multipleOf with decimals fails validation

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
latest version

** Issue **
The following schema fails validation (probably due to float calculations) for example:
value `0.94` fails,
value `0.93` passes

```
var schema = {
    "type": "number",
    "minimum": 0,
    "multipleOf": 0.01
};
```

Here's the Runkit
https://runkit.com/embed/5elnwf1fku5z

A possible solution could maybe be to use BigNumberJS internally.