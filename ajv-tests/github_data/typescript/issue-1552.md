# [1552] Confused about anyOf and oneOf in typescript, they need to be mandatory ?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.1
**Your typescript code**

Given the abstract here of the schema, if I remove anyOf and oneOf that the typescript types complain that it's not correctly typed.

If I add them then I get

schema is invalid: data/anyOf must NOT have fewer than 1 items, data/oneOf must NOT have fewer than 1 items

If I leave out the anyOf and oneOf and NOT type it and validate my schema, it works correctly.

I created my schema using this online tool by pasting my json.

https://extendsclass.com/json-schema-validator.html

I had to remove this 

```	
"$schema": "http://json-schema.org/draft-07/schema#", 
````

Here is the beginning part of my schema

```
  get schema(): JSONSchemaType<Config> {
    return {
      anyOf: [],
      oneOf: [],
      required: ["PoolConfig"],
      properties: {
        PoolConfig: {
          type: "object",
          required: [
            "address",
            "coinbaseString",
```

Is this a problem ?

Not sure why I have to give these 2 properties, I tried passing undefined, but still the same.

I have an interface defined for Config

```
interface Config {
  PoolConfig: PoolConfig
}
```