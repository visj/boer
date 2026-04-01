# [1962] Impossible to know whether valid inside of anyOf/validateUnion loop

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for change proposals.
For other issues please see https://ajv.js.org/contributing/
-->
**What version of Ajv you are you using?**
Latest

**What problem do you want to solve?**
I'm writing a custom keyword which I intend to use to coerce strings to `ObjectId`s and `Date`s:

```ts
  import { ObjectId } from 'mongodb';

  const allowableCoercions = ['Date', 'ObjectId'];

  ajv.addKeyword({
    keyword: 'coerce',
    trackErrors: true,
    // Run after all validators
    post: true,
    // `schemaType` is the type(s) of the possible values of the `coerce` field,
    // in the schema. Currently those values are all either `'ObjectId'` or `'Date'`.
    schemaType: 'string',
    error: {
      message: (cxt: KeywordCxt) => `must be able to coerce to ${cxt.schema}`,
    },

    code(cxt: KeywordCxt) {
      const { gen, data, parentSchema, it } = cxt;
      const { parentData, parentDataProperty } = it;

      // Only attempt coercion if validation has succeeded
      gen.if(_`${cxt.errsCount} === 0`, () => {
        const objectIdRef = gen.scopeValue('root', {
          ref: ObjectId,
          // NOTE: since we do not have a `code` property here this cannot be used with a "standalone"
          // validator. That should be fine since this is restricted to backend
          // https://ajv.js.org/standalone.html
        });

        const coerceTarget = parentSchema.coerce;

        if (!allowableCoercions.includes(coerceTarget)) {
          throw new Error(
            `Cannot coerce to type ${coerceTarget}. Allowable coercions are: ${allowableCoercions}`,
          );
        }

        const stringAndParentDefined = _`typeof ${data} === "string" && ${parentData} !== undefined`;

        // We can only modify a value in place if it is passed in by reference ie "parent defined"
        gen.if(
          stringAndParentDefined,
          () => {
            if (coerceTarget === 'ObjectId') {
              gen.try(
                () => {
                  const objId = gen.const(
                    'objId',
                    _`new ${objectIdRef}(${data})`,
                  );
                  gen.assign(data, objId);
                  gen.assign(_`${parentData}[${parentDataProperty}]`, data);
                },
                (_) => {
                  cxt.error(true);
                },
              );
            }
            if (coerceTarget === 'Date') {
              const timestamp = gen.const('timestamp', _`Date.parse(${data})`);
              gen.if(
                _`!isNaN(${timestamp})`,
                () => {
                  gen.assign(data, _`new Date(${timestamp})`);
                  gen.assign(_`${parentData}[${parentDataProperty}]`, data);
                },
                () => {
                  cxt.error(true);
                },
              );
            }
          },
          () => {
            cxt.error(true);
          },
        );
      });
    },
  });
```
This works fine under most situations, however (and this probably won't surprise you) it performs unexpectedly when using on `anyOf` schemas:

```js
    const schema = {
      anyOf: [
        {
          additionalProperties: false,
          type: 'object',
          properties: {
            thing: {
              type: 'string',
              pattern: '^[0-9a-fA-F]{24}$',
              coerce: 'ObjectId',
            },
            otherThing: {
              type: 'string',
              pattern: '^[0-9a-fA-F]{24}$',
              coerce: 'ObjectId',
            },
          },
          required: ['thing', 'nextThing'],
        },
        {
          additionalProperties: false,
          type: 'object',
          properties: {
            thing: {
              type: 'string',
              pattern: '^[0-9a-fA-F]{24}$',
              coerce: 'ObjectId',
            },
          },
          required: ['thing'],
        },
      ],
      $schema: 'http://json-schema.org/draft-07/schema#',
    };
```

The `cxt.errsCount` causes the coerce logic to skip over attempting to coerce the `thing` because the `validateUnion` code isn't resetting errors in between loops of the schema:
https://github.com/ajv-validator/ajv/blob/c067d6d9c3285054ea4c0a2d2adbbc8b5d631935/lib/vocabularies/code.ts#L146-L160

**What do you think is the correct solution to problem?**
I think it could be possible to `resetErrors` at the beginning of the loop in `validateUnion`:
```ts
export function validateUnion(cxt: KeywordCxt): void {
  const {gen, schema, keyword, it} = cxt
  /* istanbul ignore if */
  if (!Array.isArray(schema)) throw new Error("ajv implementation error")
  const alwaysValid = schema.some((sch: AnySchema) => alwaysValidSchema(it, sch))
  if (alwaysValid && !it.opts.unevaluated) return

  const valid = gen.let("valid", false)
  const schValid = gen.name("_valid")

  gen.block(() =>
    schema.forEach((_sch: AnySchema, i: number) => {
      resetErrorsCount(gen, cxt.errsCount) // ADD THIS LINE HERE
      const schCxt = cxt.subschema(
        {
          keyword,
          schemaProp: i,
          compositeRule: true,
        },
        schValid
      )
      gen.assign(valid, _`${valid} || ${schValid}`)
      const merged = cxt.mergeValidEvaluated(schCxt, schValid)
      // can short-circuit if `unevaluatedProperties/Items` not supported (opts.unevaluated !== true)
      // or if all properties and items were evaluated (it.props === true && it.items === true)
      if (!merged) gen.if(not(valid))
    })
  )

  cxt.result(
    valid,
    () => cxt.reset(),
    () => cxt.error(true)
  )
}
```

I believe this will change behavior slightly as the errors reported from `anyOf` validation failures will not contain every single `anyOf` condition failure, but instead will only have the last one. 

Is there some other condition I can check inside of my coerce logic to evaluate whether the schema is valid or not?

**Will you be able to implement it?**

I can definitely implement the above solution, I'm not 100% sure whether it'll be what you want...