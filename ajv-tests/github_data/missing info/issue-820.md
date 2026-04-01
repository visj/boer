# [820] if/then/else & error messages

Hi experts,

I would like to customize some error message in the if/then/else logic. But it seems that ajv is not support that or I make some mistakes. Does anyone know how to do it? Thanks in advance.

Following is a example...

Example:

```javascript
const schema_motor = {
  if: {
    properties: {
      dad_phone_number: {
        type: 'number',
      }
    },
    errorMessage: {
      properties: {
        dad_phone_number: 'Dad\'s phone number is incorrect.'
      }
    }
  },
  then: true,
  else: {
    properties: {
      mum_phone_number: {
        type: 'number'
      }
    },
    errorMessage: {
      properties: {
        mum_phone_number: 'Mum\'s phone number is incorrect.'
      }
    }
  }
}
```

@epoberezkin
