# [1859] Argument of type 'Partial' is not assignable to parameter of type 'ErrorObject'

**Versions**
`ajv: 8.6.3`
`koa: 2.13.4`

**Summary**
I am trying to implement an ajv middleware to validate in my koa requests. I have got my normal validator working but I can't seem to even compile my code for async validator. I have commented the part where my IDE (vs-code) complains about the TS error. Why am I getting only `Partial` of `ErrorObject[]` here? Is this a bug?

**Code**


```typescript
export const validateAsyncMiddleware = (validate: AsyncValidateFunction) => async (ctx: Context, next: NextFunction) => {
    try {
      const result = await validate(ctx.request.body);
      return next();
    } catch (err) {
      if (!(err instanceof Ajv.ValidationError)) throw new AppError("AJV fail", 500);

      const errorMessages = assembleErrors(err.errors); // <- TS complains err.errors is of type Partial<ErrorObject<T>>[] 

      // rest of code
    }
}

function assembleErrors(validationErrors: ErrorObject[]) {
  // My custom logic
}

```
