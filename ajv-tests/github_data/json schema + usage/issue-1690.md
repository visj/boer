# [1690] how to skip check some properties with a keyword?

 **What problem do you want to solve?**

The ajv version is V6.

I want to skip validate a property if the **dependOn keyword** is true. The code like below:

```js
const schema = {
    properties: {
        foo: {
            type: 'string',
            dependOn: 'bar > 5',
            maxLength: 5,
        },
        bar: {
            type: 'number'
        },
        sha: {
            properties: {
                ka: {
                    type: 'number'
                }
            }
        }
    }
}

const data = {
    foo: 'abcdefg',
    bar: 10,
    sha: {
        ka: 20
    }
}
```

The result should be true because the dependOn keyword is true.

**What do you think is the correct solution to problem?**

I tried to solve it by `addKeyword('dependOn')`, but it doesn't work:

- delete the foo in schema if the dependOn condition is true
- return true when validate the dependOn condition is true

**Will you be able to implement it?**
I tried..but failed
