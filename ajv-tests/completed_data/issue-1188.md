# [1188] Can't resolve reference 

AJV couldn't resolve reference of sub schema in one of two absolutely identical schemas.

```ts
        const ajv = new Ajv({
            validateSchema: true,
            schemaId: '$id',
            allErrors: true
        });

        ajv.addSchema([
            require(path.resolve(__dirname, '../../design/schemas/server/v3/base.json')),
            require(path.resolve(__dirname, '../../design/schemas/server/v3/person.json')),
            require(path.resolve(__dirname, '../../design/schemas/server/v3/order.json'))
        ]);
```

order.json
```json
{
   ...
    "allOf": [
        {
            "$ref": "base.json"
        },
        {
  ...
```
person.json
```json
{
    ...
    "allOf": [
        {
            "$ref": "base.json"
        },
        {
  ...
```
Schemas are in the same folder.

```ts
    // At the same file:
    valid = ajv.validate('order_v3', item);  // true
    ...
    valid = ajv.validate('person_v3', item);  // can't resolve reference base.json from id person_v3#
```

How's this possible?

**Details:**
node v13.2.0
ajv v6.12.0