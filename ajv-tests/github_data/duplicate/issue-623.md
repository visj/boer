# [623] UniqueItems is very slow

We need to check the array items to be unique. We have 160 000 and it takes forever to validate. The problem is that the uniqueItems algorithm is very slow as it sorts elements and uses for loop.
Why not use hash tables for that? Something like that:

```
function hasDuplicates(array) {
    return (new Set(array)).size !== array.length;
}
```