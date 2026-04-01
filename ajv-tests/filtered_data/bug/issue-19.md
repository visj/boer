# [19] Bug with allErrors: true and larger required list

Hi,

I have a rather complex JSON schema, with a required list of a sub object that has 19 items.

When I validate a JSON with the option allErrors turned on, the validation will fail, giving me a whole List of required Items which ajv claims to be missing, although I am sure they are there. 

When I turn off allErrors OR reduce the required list to 10 or less items, the validation will pass.

Best regards M
