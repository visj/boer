# [800] how to use conditional


I have two properties if "A" exists requires "C" but if B === "Device2", C is not required. I'm confused since I do not know how to do a conditional without it being too big

**"ajv": "^6.0.0",**


```javascript
 allOf: [{
      if: {
        properties: {
          A: {
            const: 'device1',
          },
        },
      },
      then: {
          if: {
            properties: {
              B:{
                not: {
                  const: 'device2'
                }
              },
            },
          },
          then: {
            required: [
              'C',
            ],
          },
        },

    },
]

```


if there were another property on which c depends, this structure would not be readable.

which can be the best solution to use conditionals with the validator
