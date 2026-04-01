# [2374] Why regex pattern not works ?

Hello,

I want to use regex in AJV but it does not work. Can you say me what I am doing wrong ?

I tried this

```
      firstname: {
        type: 'string',
        pattern: '^[a-zA-Z\s]$',
        minLength: 1,
        maxLength: 60
      },
```

and this
```
      firstname: {
        type: 'string',
        pattern: '/^[a-zA-Z\s]*$/',
        minLength: 1,
        maxLength: 60
      },
```