# [71] What about convertation\transformation?

What do you think about data convertation\transformation by `format` or by custom keyword?

Example sheme 1:

``` JSON
"queryParam": {
      "name": "query",
      "in": "query",
      "type": "string",
      "format": "json"
}
```

``` Javascript
ajv.addFormat('json', function(data, cb) {
   try {
     var obj = JSON.parse(data);
   } catch (err) {
     return cb(err);
   }
   cb(null, obj);
})
```

Example sheme 2:

``` JSON
"queryParam": {
      "name": "query",
      "in": "query",
      "type": "string",
      "x-transform": "json"
}
```

``` Javascript
ajv.addKeyword('x-transform', function(type, data, cb) {
   if (type === 'json') {
     try {
       var obj = JSON.parse(data);
     } catch (err) {
       return cb(err);
     }
     return cb(null, obj);
   }

   return cb('Transformation '+type+' not found');
})
```
