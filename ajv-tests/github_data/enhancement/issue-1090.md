# [1090] More user friendly ErrorObject TypeScript type

**What problem do you want to solve?**
In its current state [`ErrorObject`](https://github.com/epoberezkin/ajv/blob/master/lib/ajv.d.ts#L291) is not very user friendly in certain scenarios. For example:
```ts
function useError(ajvError: ErrorObject) {
  switch(ajvError.keyword) {
    case 'enum': {
      // ErrorParameters
      ajvError.params
    }
  }
}
```
It would be really useful if we could get `EnumParams` here, instead of `ErrorParameters`. It's possible to use type-guards to achieve something similar but the code gets a bit messier.

**What do you think is the correct solution to problem?**
IMO it can be improved by using _discriminated unions_. If we do something like:
```ts
interface IErrorObject<T, U> {
  keyword: T,
  params: U,
  ...
}

type EnumErrorObject = IErrorObject<'enum', EnumParams>;
type RequiredErrorObject = IErrorObject<'required', RequiredParams>;
...

export type ErrorObject = EnumErrorObject | RequiredErrorObject | ...;
```
Then we will get  `EnumParams` inside the `enum` case.
```ts
function useError(ajvError: ErrorObject) {
  switch(ajvError.keyword) {
    case 'enum': {
      // EnumParams
      ajvError.params
    }
  }
}
```
**Will you be able to implement it?**
Yes