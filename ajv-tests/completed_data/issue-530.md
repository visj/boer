# [530] can't resolve reference #/definitions/Pet from id #

Hi epoberezkin, 

We are using your library to validate against swagger json.
We just encountered error in using the validate method.

 ajv.validate( {"$ref": "#/definitions/Pet"}, obj);
ERROR {"message":"can't resolve reference #/definitions/Pet from id #","missingRef":
"#/definitions/Pet","missingSchema":""}
TypeError: Cannot read property 'message' of undefined

Possible Solutions
1) use the ajv.validate method but the problem is how to make the schemaRefKey dynamic in function validate(schemaKeyRef, data);

  ajv.addSchema(swaggerSchema, 'swagger.json')
  var isValid = ajv.validate({ $ref: 'swagger.json#/definitions/Pet' }, obj);
  console.log('isValid:'+ isValid)
  console.log(JSON.stringify(ajv.errors));
 
2) use the ajv.getSchema but id='http://example.com/schemas/swagger.json#/definitions/Pet' attribute creates some errors in swagger.json

> Errors
Hide
Schema error at instance
additionalProperty "id" exists in when not allowed
Jump to line 0

   ajv.addSchema(swaggerSchema, 'Pet');
   const validate = ajv.getSchema('http://example.com/schemas/swagger.json#/definitions/Pet');
  console.log(`validation: ${validate(obj)}`);


Thanks