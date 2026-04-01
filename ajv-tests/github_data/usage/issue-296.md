# [296] Is there any way to reuse compiled schema 

Hi 
I am using AJV(latest) with [express](http://npmjs.com/package/express). here is current code

```
app.get('test', function (req, res, next) {
    var validate = ajv.compile(schema);
    if( !validate(req.body) ) return sendError(validate.errors)
    next();
})
```

Is there any way to do this. Like just compile it once and use clone/copy of it on each call.

```
var validate = ajv.compile(schema);

app.get('test', function (req, res, next) {
    if( !validate(req.body) ) return sendError(validate.errors)
    next();
})
```

I also tried clone, cloneDeep of [lodash](http://npmjs.com/package/lodash). But now working.
Thank you.
