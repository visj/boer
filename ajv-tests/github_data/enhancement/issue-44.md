# [44] Are there any plans for i18n-support?

We want to use ajv to validate complex configurations against predefined schemas, but our application is in German and English, so we would like to translate the error messages.
I guess the error messages are coming from def._errorMessages in [lib/dot/definitions.def](https://github.com/epoberezkin/ajv/blob/master/lib/dot/definitions.def), so maybe we could choose one set of translations there, dependent of some variable, but I have no experience with dot-templating.

Sorry for the premature issue-creation, I accidentally hit some kind of github-shortcut.
