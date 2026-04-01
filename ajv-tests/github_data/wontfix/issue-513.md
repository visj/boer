# [513] Add method or configuration to avoid throwing exception when adding non-unique schema(s).

**What version of Ajv you are you using?**

`5.1.0`

**What problem do you want to solve?**

There is no way to control weather `.addSchema` method throws exception upon uniqueness check.

I see why this is. As with the keyword methods, it is expected that you remove the keyword then add it if you wish to change/overwrite it.

It's possible I'm missing something in the documentation, but I find throwing when adding an existing schema to be rather unexpected (and in some cases difficult to avoid).

**What do you think is the correct solution to problem?**

While it would be ideal to provide configuration around this behavior, it would be most simple to add a method `.setSchema` that looks something like this:
```
// ... @this Ajv
setSchema(schema, key) {
  try {
    this.addSchema(schema, key);
  } catch(e) {
    this.removeSchema(key);
    this.addSchema(schema, key);
  }
}
// ...
```
I would have to further review the source of Ajv in order to assess how a configurable solution would look.

**Will you be able to implement it?**

Sure. I'd like some thoughts/feedback before moving forward though.
