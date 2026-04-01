# [2419] Integers as Discriminators

**What version of Ajv you are you using?**

8.12.0

**What problem do you want to solve?**

I have an existing schema where I'm trying to use it's integer properties as discriminators. 

It seems that ajv discriminators only allow integers. I'm not sure if this is an [implementation](https://github.com/ajv-validator/ajv/blob/5370b842a92158454cf56de907894223bc5537ef/lib/vocabularies/discriminator/index.ts#L102) limitation or something defined by the [OpenAPI spec](https://spec.openapis.org/oas/v3.1.0#discriminator-object).

**What do you think is the correct solution to problem?**

Update the discriminator to allow integers. Ideally the integer can just be converted to a string for the map lookup.

**Will you be able to implement it?**

Possibly
