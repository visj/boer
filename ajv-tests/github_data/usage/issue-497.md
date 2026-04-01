# [497] Do" into dataPath on errors

Why and How can i remove the dot added on dataPath?

```
const Schema = {
  '$async': true,
  "properties": {
      "key": {
          "type": "number",
      }
  }
}
```
```

return validate(values).then(function (data) {
    console.log('Data is valid', data);
  }).catch(function (err) {

// error.dataPath contain ".key" and should be only "key"
err.errors.forEach((error) => {
      errors[error.dataPath] = error.message; 
    });

})
```