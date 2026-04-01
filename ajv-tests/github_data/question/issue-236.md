# [236] Why do we attach the error list to the validation function?

This is less of an issue and more of a question, but I've never understood why schema validators prefer to store error lists on the function object instead of just returning them - I can understand wanting to simply return a boolean for conditional checks, but the statefulness greatly increases (at least for me) the mental strain to figure out how and when errors should be added. Recursion is so much more difficult to use, it's feels easy to end up in weird states, and it feels like we're passing data by attaching to function instances rather than using return as it's intended.

It seems like to me either returning a list of errors or a tuple of errors and validity would be the most transparent and simple interface - is there a deeper justification I'm just not aware of?

To be clear, I'm not against the "stateful" storage of errors in principle, but I think it should be left to the downstream developer - if I were to feel that it was necessary for my particular project, I would do something like the following to accomplish the same interface:

validation.js

``` javascript
import AJV from 'ajv';

export var errors = []

... // all the AJV initialization business

export default function(obj) {
  errors = validate(obj)
  return errors.length > 0
}
```

Right now it's _always_ required. Just seems extreme.
