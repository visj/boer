# [1083] How to auto format value when valid == false

`let data = {
		email: 'asd',
		role_id: '123'
	}

let createSchema =
    {
      required: ['email', 'role_id'],
      properties: {
        email: {
          type: 'string'
        },
        role_id: {
          type: 'integer',
          errorMessage: {
            type: 'role_id must be a number'
          }
        }
      }
    }
      let ajv = new Ajv();
      let validate = ajv.compile(createSchema);
      let valid = validate(data);
		  console.log(valid)
		  console.log(validate)`

**I have a question, can I auto format true value (is number) for role_id when 'valid' == false**