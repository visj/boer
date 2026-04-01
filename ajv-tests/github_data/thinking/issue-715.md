# [715] [Q] Is it possible to remove default?

Hi,

excuse me if it was asked or i miss it in readme (i searched closed issues).

I need to remove from objects properties that match default values (=== not a shallow equal). For example:
```js
const schema = {
  type: 'object',
  properties: {
    a: { 
     type: 'string',
     default: 'a'
    },
    b: {
      type: 'string',
      default: 'b'
    }
  }
}

const obj = { a: '123', b: 'b' };

// so after applying some code 

const obj1 = removeDefault(obj);
// obj1 should be { a: '123' }
```

I did not notice there was any sort of similar issue or option like removeDefault (there is remodeAdditional already). I can craft code for my own use case (i do not use anyOf e.g), but maybe something more generic appreciated?

My use case is pretty simple. I use schema to generate form, and i generate json from it. This json would be send to browser and receiver part already know all defaults. So this way i could minimize payload, because i have sometimes around 100 keys and > 90% will match default.

Thanks