# [1557] validate typescript signature incorrect?

If you pass 
```
const data: unknown  = 'some data from unknown source';
validate<Type>("stringSchema", unknownData);
```

you will always match the first overload, and the first overload is missing the async case.

![image](https://user-images.githubusercontent.com/1499050/115541907-f642ba00-a29f-11eb-8b94-ff4ad04670b6.png)

**Are you going to resolve the issue?**
I can, if someone confirms that it's a valid issue.