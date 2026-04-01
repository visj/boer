# [1412] import error

error
![image](https://user-images.githubusercontent.com/39870180/105965349-41449b00-60be-11eb-9c4b-0af0e9124782.png)

using
```
import Ajv from 'ajv';

export const deepClone = (obj) => {
  console.log('深复制');
  return JSON.parse(JSON.stringify(obj));
};

export const checkJSON = (value, schema) => {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(value);
  if (!valid) return validate.errors;
  return true;
};
```