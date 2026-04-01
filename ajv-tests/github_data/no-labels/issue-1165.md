# [1165] Make the validation error more detailed

The feature will improve the validation message returned from function: .errorsText

*example message*

before change:
data.env should be equal to one of the allowed values

after change:
data.env should be equal to one of the allowed values (nodejs,python,jvm)

How to use
```javascript

validator.errorsText(errors, { extraInfo: true });

```

I created PR for that: https://github.com/epoberezkin/ajv/pull/1166

