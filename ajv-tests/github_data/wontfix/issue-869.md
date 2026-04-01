# [869] ajv string type | Question

Hi 

I am trying to use custom error messages with ajv-errors.
Everything is working fine with errorMessage as string but when I try to replace it with String object I get this error message.

```
keyword schema is invalid: data/minLength should be string
```

Next code does not work
```js
const schema = {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          minLength: 1,
          errorMessage: {
            minLength: new String("test"),
          },
        },
    }
```

I know you will tell me that I need to use just "test" or String("test") instead of new String("test") but here is my use case:

I am using translated messages which are translated on the fly at the end of whole request and no during the validation process. I do not want to send locale as parameter to each function and I am not able to use global variable because I have multiple requests with different locales.
I want to do:

```js
class TranslateString extends String {
  constructor(message: string, params?: Object) {
    super(message);

    this.params = params;
  }

  translate(t): string {
    return t(this.message, this.params);
  }
}

const schema = {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
          minLength: 1,
          errorMessage: {
            minLength: new TranslateString("Name {name} is too short.", { name: 'Adam' }),
          },
        },
    }
};
```

I am translating errors at the end of request and I need to know which message is translation string. Other standard "strings" I am not translating.

Let me know if it is possible somehow allow custom type for errorMessage. 
Thank you very much @epoberezkin 