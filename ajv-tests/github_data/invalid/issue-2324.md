# [2324] Fail object validation on additional properties

Hello!

Thank you for this great library!

However, I can't really find a way to make Ajv to fail validation when encountering additional properties in objects. The only related option I can find is `removeAdditional`, but it just silently ignores the extra properties.

The existence of the unexpected properties in a JSON configuration file or an API request is often a sign of a mistake of the document author. The safer behavior is to detect such cases and fail the document validation, before it could lead to problems. This ensures better DX.

Here's the config option in other validation libraries:

- zod — `strict`
  https://github.com/colinhacks/zod#strict

- joi — `allowUnknown`
  https://joi.dev/api/?v=17.9.1#anyvalidatevalue-options

- yup — `noUnknown`
  https://github.com/jquense/yup#objectnounknownonlyknownkeys-boolean--true-message-string--function-schema

Am I missing something obvious here?

Thanks!