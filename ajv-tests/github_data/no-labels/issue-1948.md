# [1948] Not possible to use schema for validation if it has nullable property with type "any"

According to OAS 3.0 docs, it's possible to define a schema for a property of any type including `null` like this:
```
components:
  schemas:
    AnyValue:
      nullable: true
      description: Can be any value, including `null`.
```
detailed documentation can be found [here](https://swagger.io/docs/specification/data-models/data-types/#any)

But in such case, if I'll try to use this schema for data validation via AJV I'll get an error `"nullable" cannot be used without "type"`
As far as I understood there is a limitation of using the keyword `nullable` only with defined `type` as its sibling.
Is there any possible workaround for such a case, or some other way that I can define a schema with a nullable property of any type, so AJV can validate against such schema?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Tried on 8.11.0 and 8.6.2, behavior is the same

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```
{
        strict: false,
        allErrors: true,
        verbose: true,
}
```
Reproduction

https://runkit.com/aposiker/624c2bb75af68f000839fea2