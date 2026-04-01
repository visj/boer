# [256] Return also errors when calling Ajv.validate (for stateless usage)

In the current version all errors of a validation are not returned, but are saved in the ajv instance, thus if I want to access them I need something like that:

`
ajv.addSchema(schema, 'mySchema');
var valid = ajv.validate('mySchema', data);
var errors = ajv.errors; // All validation errors are written into this property
`

This is of course no problem in a normal javascript environment. We have however a quite advanced scenario where we call AJV in our java backend and we have only one AJV instance (that we initialize on server startup) for all requests. As far as I can tell this works, except for retrieving the specific error properties which are always written to the used AJV instance and is hence **not** stateless.

Now my question: Is it possible to create e.g. a new method (also for not breaking the existing API) like Ajv.validateWithErrorResult(...) that return a result object like e.g. following:
`
{
  valid: false,
  errors: {
     ....
  }
}
`

Hopefully this may be only a change in API (?)
