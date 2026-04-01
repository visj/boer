# [2057] The instancePath property of errors

I would like to know if there is any other solution to cancel the "errorDataPath:'property'" parameter, to solve the "required" check that the "instancePath:''" property is empty


`
{
    instancePath: '',
    schemaPath: '#/required',
    keyword: 'required',
    params: { missingProperty: 'name' },
    message: "must have required property 'name'"
  }
`