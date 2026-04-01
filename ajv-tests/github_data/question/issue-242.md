# [242] Will error message be overwritten by concurrent validations?

Hi, I was reading the README, the following line interests me:

> Please note: every time validation function or ajv.validate are called errors property is overwritten. You need to copy errors array reference to another variable if you want to use it later (e.g., in the callback). See Validation errors

For example, 

```
const validate = ajv.compile(customerSchema)

function checkCustomer(id) {
  return promiseFetch(id).then(customer => {
    if (!validate(customer)) {
      console.log(`Customer ${id} has errors: ${validate.errors}`)
    }
  })
}

[id1, id2, id3, ...].forEach(id => {
  checkCustomer(id)
})
```

Am I right that this code has a risk of having a wrong id-error mapping in `Customer ${id} has errors: ${validate.errors}` output?

Do I have to create and compile a new ajv insance inside each promise to ensure that my error messages won't be overwritten?
