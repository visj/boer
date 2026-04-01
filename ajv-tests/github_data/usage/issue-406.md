# [406] Use with CSP & Unsafe-Eval

I see that AJV uses `eval` in the source to compile the Schema object. Is it possible to provide AJV with some sort of precompiled version of the schema to avoid using `eval`? We are working towards removing 'unsafe-eval' in our CSP headers and this is the last blocker.