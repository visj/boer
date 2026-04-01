# [208] override default validation behavior in custom keyword

I might be trying to bend the rules a bit much here, but is it possible to override the validation behavior of other keywords in a custom keyword - perhaps like so:

```
{ type: 'string', allowAFunctionAsWell: true }
```

Understandably this could be implemented with `anyOf`/`oneOf`, but in my particular case this would make implementation much cleaner if it were possible. 
