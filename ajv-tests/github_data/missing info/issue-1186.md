# [1186] handling date with ajv

Hello, I have a question with the type "format", in my properties I add dateOfBirth and this has to be dates higher than '2002-01-01 "and I do it with the example that is in the documentation:
    " format ":" date "
    "formatMaximum": "2016-02-06",
    "formatExclusiveMaximum": true
but when I send a date higher than '2002-01-01 ", the error is not triggered, thanks for reading, I would appreciate an answer please
my code:
allOf: [
    {
      properties: {
        email: {
          type: 'string',
          format: 'email',
        },
        password: { type: 'string', minLength: 6 },
        dateOfBirth: {
          type: 'string',
          format: 'date',
          formatMaximum: "2002-01-01",
          formatExclusiveMaximum: true

        },
}
}
]
