# [717] [TS] Thenable vs. PromiseLike

If I understand it correctly `Thenable` is nothing more than a disguised Promise, right? Is there a reason why some libraries use `Thenable` rather than the official typescript Promise declaration?

Using `Thenable` is not possible with native Promises.

```typescript
import * as Ajv from "ajv"

const foo: Ajv.Thenable<boolean> = new Promise<boolean>((resolve, reject) => {
  if ("condition")
    resolve(true)

  reject("Nope")
})
```

Will always compile with an error:

```
error TS2322: Type 'Promise<boolean>' is not assignable to type 'Thenable<boolean>'.
  Types of property 'then' are incompatible.
    Type '<TResult1 = boolean, TResult2 = never>(onfulfilled?: ((value: boolean) => TResult1 | PromiseLike<...' is not assignable to type '<U>(onFulfilled?: ((value: boolean) => U | Thenable<U>) | undefined, onRejected?: ((error: any) =...'.
      Types of parameters 'onfulfilled' and 'onFulfilled' are incompatible.
        Type '((value: boolean) => U | Thenable<U>) | undefined' is not assignable to type '((value: boolean) => U | PromiseLike<U>) | null | undefined'.
          Type '(value: boolean) => U | Thenable<U>' is not assignable to type '((value: boolean) => U | PromiseLike<U>) | null | undefined'.
            Type '(value: boolean) => U | Thenable<U>' is not assignable to type '(value: boolean) => U | PromiseLike<U>'.
              Type 'U | Thenable<U>' is not assignable to type 'U | PromiseLike<U>'.
                Type 'Thenable<U>' is not assignable to type 'U | PromiseLike<U>'.
                  Type 'Thenable<U>' is not assignable to type 'PromiseLike<U>'.
                    Types of property 'then' are incompatible.
                      Type '<U>(onFulfilled?: ((value: U) => U | Thenable<U>) | undefined, onRejected?: ((error: any) => U | ...' is not assignable to type '<TResult1 = U, TResult2 = never>(onfulfilled?: ((value: U) => TResult1 | PromiseLike<TResult1>) |...'.
                        Types of parameters 'onFulfilled' and 'onfulfilled' are incompatible.
                          Type '((value: U) => TResult1 | PromiseLike<TResult1>) | null | undefined' is not assignable to type '((value: U) => TResult2 | Thenable<TResult2>) | undefined'.
                            Type 'null' is not assignable to type '((value: U) => TResult2 | Thenable<TResult2>) | undefined'
```

Removing the `Thenable` Interface and replacing references with `PromiseLike` in the typings get rid of the error. Am I safe to provide a PR which does that or is there a reason behind `Thenable` I seem to miss?

/cc @blakeembrey 