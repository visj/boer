# [720] Profile or analyze performance

My apologies for the question in this format, but I was not able to locate an answer via the docs or FAQ....

I am wondering how I might be able to profile and/or debug what may be causing slow validation on a portion of our schema?  As a bit of background, we are successfully using ajv to do partial validation at various levels within our schema.  For most circumstances this works exceedingly well (and quickly).  However, there are a few cases where this validation can take much much longer than it does in the general case (general case takes very low ms to complete, problem case taking 3 - 4+ seconds to complete).  Schema is pre-compiled and cached, so that is taken out of the equation.  Problem partial schema is quite large (and deeply nested), so it is not easy to narrow down what may be the culprit.  We are using allErrors: true as we need to know all potential erorrs, - again in most cases this is working quite nicely and very quickly.   

Any ideas and insights will be greatly appreciated.  Unfortunately, the overall JSON structure (and hence the required schema) is not something we have control over as we must conform to external spec.

TIA!