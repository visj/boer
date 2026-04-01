# [2175] Receiving 'Content Security Policy of your site blocks the use of 'eval' in JavaScript' error while using AJV library.

ajv.validate(schema, data); is not working without specifying 'unsafe-eval' in CSP.

I want to know if is there any plan to resolve this issue without modifying CSP since this is creating security breach.

Is there any workaround to this issue ?
