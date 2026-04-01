# [1663] Support multiple property names in `discriminator` keyword

**What version of Ajv you are you using?**

8.6

**What problem do you want to solve?**

My schema depends on value of two fields, so I wanted to implement something like this:

```
{
    type: 'object',
    discriminator: { propertyName: ['a', 'b'] }
    required: ['a', 'b'],
    oneOf: [
       {
          properties: {
            a: { const: true }
            b: { const: 'b' }
            c: { type: 'string' }
          }
       },
       {
          properties: {
            a: { const: false }
            b: { const: 'bb' }
            c: { type: 'number' }
          }
       }
       ...
    ]
}
```

**What do you think is the correct solution to problem?**

Add ability to define multiple properties in `discriminator`

**Will you be able to implement it?**

I am not sure...