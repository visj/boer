# [1033] How I take the keywords value from schema where can not use $data?

<!--
Frequently Asked Questions: https://github.com/epoberezkin/ajv/blob/master/FAQ.md
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://github.com/epoberezkin/ajv/blob/master/CONTRIBUTING.md
-->

**v 6.52**

**I want to use the keywords value from schema, I find a way to use it in minimum and somewhere, but what should I do if I want to use them in some other way?, like this**
```
{
  type: 'object',
  properties: {
    size: {
      type: 'integer',
      minimum: xbytes(MIN_VOLUME_INCREASE_SIZE + 'MB'),
      maximum: xbytes(MAX_VOLUME_SIZE + 'TB'), // size <= maxSize
      exclusiveMinimum: { $data: '1/staticSize' }, // size > staticSize
      errorMessage: {
        maximum: t('storage can not bigger than %s TB!', {args: MAX_VOLUME_SIZE}),
        minimum: t('should smaller than %s MB', {args: MIN_VOLUME_INCREASE_SIZE}),
      }
    },
  },
  errorMessage: {
    properties: {
      size: t('please assign storage between %s and  %s', {args: [params_from_schema1, params_from_schema2]}),
    }
  }
}
```
see the `params_from_schema1` and `params_from_schema2` in the fourth row from the bottom.

and my validate function: 
```
function validate(schema, values) { // values is the value ready to validate
  const ajvValidate = ajv.compile(schemas[schema]);
  const valid = ajvValidate(values);
  console.log(ajvValidate.errors)
  if (!valid) {
    throw new SubmissionError({
      _error: ajvValidate.errors[0],
    });
  }
}
```