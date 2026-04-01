# [1307] missing local definitions

Hi!

im trying to reuse  same schemas for api validation and swagger doc, but i have faced with issue that references working differently in both environments.

in my case i have added definition for semver property type:
`
{
  "$id": "semver",
  "type": "string",
  "minLength": 5,
  "maxLength": 14,
  "pattern": "^(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)\\.(?:0|[1-9]\\d*)$"
}
`
so if i want to use it with AJV i can add it as scheme before compile and use $ref in main scheme:

`
 "version": {
      "$ref": "semver"
    },
`

but swagger cant use ref by $id... so in that case i can include it to definitions section like:

`
const definitions = require('./src/schemas/definitions');

module.exports = {
  openapi: '3.0.1',
  info: {
    title: pkg.name,
    version: pkg.version,
    description: pkg.description,
  },
  definitions: definitions,
`

but then i should change my validation scheme to: 

`
 "version": {
      "$ref": "#/definitions/semver"
    },
`

is there any chance to include definition to AJV module, so i can use the exactly same scheme in both cases - runtime validation and api documentation? 

`MissingRefError: can't resolve reference #/definitions/semver `