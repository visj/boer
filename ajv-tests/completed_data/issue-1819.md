# [1819] minContains: 0 broken, requires at least one element.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
 8.8.0. Yes


***Example code***
```javascript
        import Ajv from 'ajv/dist/2020'
        const ajv = new Ajv()
        const validate = ajv.compile({
            type: 'array',
            minContains: 0,
            maxContains: 1,
            contains: { type: 'number' },
        })
       // outputs false, should be true
        console.log(validate(['apple']))
       // outputs true
        console.log(validate(['apple', 1]))
       // outputs false
        console.log(validate(['apple', 1, 2]))
```
