# [486] Extend with custom keyword to support nullable based on Open API 3 Specification

Hello,

we use internaly Swagger aka Open API. The schema differs from the JSON Schema defintion.
Eg. the type can only be one type instead of an array of types line 
`"type":["string","null"]`

To support nullable values you must define
`"type":"string",
"nullable: true`

I tried to add a new keyword nullable
`ajv.addKeyword('nullable', { type: 'boolean', macro: function (schema, parentSchema) {
  return {
    type: !!schema ? [parentSchema.type, "null"] : parentSchema.type
  };
}});`
but I can't delete the original error from the type validator.

Also I tried to override the type keyword, but this isn't possible.

How can I extend the existing type checking to prevent errors, when the value is null, based on the new nullable keyword?

I understand, that adding new keyword make the validation stronger. But how can I weaken the existing validation?

Thx
