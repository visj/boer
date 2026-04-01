# [142] ajv best practice with koa

i wonder how i should proceed to use ajv in koa.

I made some test and it seems that : 
all compile call share the same error object for the same shema and same ajv instance.
all getContext call share the same error object for the same shema and same ajv instance.

Should i use the same ajv instance for all request ?
Should i instanciate ajv for each request ? What about perf ?
Should i instanciate ajv each time i need to use it ?  What about perf ?

I tried to find examples of ajv and koa working together to be sure to proceed well but found nothing on google.
