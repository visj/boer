# [1038] [question] Can `parentSchema` has `$ref` inside?

Sorry for removed issue template. See code but can't find nothing. We have legacy code with strange line(s):
```
while (schemaPart.$ref) {  
  // Logic
}
```

Where `schemaPart` is `parentSchema` from error. 

And my question it is possible has `$ref` in `parentSchema` of `error`? Thanks for any feedback.