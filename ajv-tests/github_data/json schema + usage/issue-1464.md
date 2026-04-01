# [1464] schema is invalid: data/required should be array

Getting Error: schema is invalid: data/required should be array
    at Ajv.validateSchema (/Users/rahulvageriya/.config/yarn/global/node_modules/ajv/lib/ajv.js:178:16)  

When we used below JSON:

        - name: petId
          in: path
          required: true
          description: The id of the pet to retrieve
          type: string
          example: "1234567890"
      responses:
        '200':
          description: Expected response to a valid request 

But it worked fine when we use type or example under schema tag like below 👍 

 - name: petId
          in: path
          required: true
          description: The id of the pet to retrieve
          schema : 
            type: string
          example: "1234567890"


Is it possible to use this type and example Tag without schema.?
