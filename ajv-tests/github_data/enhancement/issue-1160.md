# [1160] ✨ Modify data when using .addKeyword

**What version of Ajv you are you using?**
`6.11.0`

**What problem do you want to solve?**
Would love to be able to mutate the data during validation when using custom keywords. Coming from a different library `isValid` I wanted to start using something more performant but quickly noticed that `ajv` doesn't support a specific type of functionality I was using with `isValid`.

I have a use case where I want to validate if a number is parseable to a BigNumber. If it isn't valid return `false` (so validation fails) but if it meets the condition return the modified data (passes validation). + Would also love to access the validated data after validating.

```js
ajv.addKeyword('graceful', {
  type: 'boolean',
  validate: (value: any, data: any) => {
    if (data === undefined) {
      return null;
    }

    if (value) {
      const number = new BigNumber(data);
      return number.isNaN() ? false : number;
    }

    return true;
  },
});

const schema = {
  type: 'object',
  properties: {
    amount: {
      type: 'number',
      graceful: true,
    },
  },
};

const data = {
  amount: "0.648416281616",
};

const validate = ajv.compile(schema);
const valid = validate(data);

console.log(typeof valid.data.amount === 'object');
// $ true

console.log(valid.data.amount);
// $ 0.648416281616

console.log(valid.data.amount.toExponential());
// $ '6.48416281616e-1'
```

**What do you think is the correct solution to problem?**
Not entirely sure since I haven't gone through the codebase myself but would love to pass a global option to `ajv` like `allowMutation: true` which then allows users to mutate the data in some way and returns the mutated data after validation.

**Will you be able to implement it?**
No. I might have missed something important in the documentation and this might be already possible though! 