# [2211] AJV does not throw type errors when given incorrect schema for a Union type in TypeScript

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.12.0. Yes. 

**Your code**

See: https://stackoverflow.com/questions/75395134/ajv-does-not-throw-type-errors-when-given-incorrect-schema-for-a-union-type-in-t
and [typescript playground](https://www.typescriptlang.org/play?jsx=0&ts=4.7.2#code/JYWwDg9gTgLgBAKjgQwM4oFYDc4DMoQhwDky2xA3AFBUCmAdgK5ECiTIAYsLQDYAmcAN5U4cAPIA5FnAC8JSS2IAaEXAAqAdTGySmscSoBfGsHoxaUXMgDGtOBwgQAQmjvDRAI2RQAXHFQwUKYA5tSeyABefgFB9KGqAPQJcCDI9ACecBAwABYWeNz8qEYmZhZWtvaOYvR2tAAe5vR86A7OrkKqDMxcvHx+bD2FfAB0Cl2NUMi9-NGBISVUpuaWNnZtagDuEHANTS1V7ahuXewz-XCDnMMjeosw6WDrjjptNXYAPodbENRU1hB6AFDgBlax5VJ+MhYEYAKRBkjBEOQaketAAPG0AHw6dxwB5PPzECAeDC0awwZSqMAEJ6wbioPx48K+Tqidn4tFEmIhAwcwwqDleKJsjmcwkkHlxPnsgWqUTda59Jny9kE2jc+bS1XGURy0RQWgAR0YwENFwA2gBdRYAoHwNpI2ipNQ5ZAwVAAEVouFMwHMPHSGgIcSh2DhCIkTpdaMxjhxcjx6qJJLJFKpohpEDpMAZKqF3nzYuTkq1wRlesF7OFRY5JeIUvLOqrCrOw1raq5pdiTf5Ld2k2m7dFda7xHYHgsFbgupnVcNJrNtEtNuM-0BqAgPFoIx4EGCAApHeDncgAJTroFbnd7w-H5Gu91en1+gNBkPBM9AA)

```javascript
import * as ajv from 'ajv';

enum EnumField {
  ONE = 'ONE',
  TWO = 'TWO'
}

interface FooBase {
  bar: string;
  baz: string;
  // many other fields
}

interface FooOne extends FooBase {
  enumField: EnumField.ONE
  extraField: string
}

interface FooTwo extends FooBase {
  enumField: EnumField.TWO
}

type Foo = FooOne | FooTwo;

const FooSchema: ajv.JSONSchemaType<Foo> = {
  type: 'object',
  properties: {
    bar: {
      type: 'string'
    },
    baz: {
      type: 'string'
    },
    enumField: {
      type: 'string'  // underspecified, this should be an enum but AJV does not complain
    }
  },
  required: []
}

const FooSchemaThatsDefinitelyWrong: ajv.JSONSchemaType<Foo> = {
  type: 'object',
  properties: {
    bar: {
      type: 'string'
    },
    baz: {
      type: 'string'
    },
    enumField: {
      type: 'string'
    },
    extraField: {
      type: 'number'  // this is definitely wrong, it should at least be string
    }
  },
  required: []
}

console.log(FooSchema)
console.log(FooSchemaThatsDefinitelyWrong)
```

**Validation result, data AFTER validation, error messages**

NA

**What results did you expect?**
I want to use ajv and JSONSchema to construct a validator for Foo, above. I want ajv to tell me when my schema does not match the type. For a straightforward non-union interface, ajv will tell me if I have properties missing or have an incomplete or incorrect type. However, with the union, it seems like ajv is getting tripped up.

I expected AJV to throw a type error, as the jsonschema types clearly do not match with the provided typescript interfaces. However, it compiles without issue for both cases. 

I would have expected ajv to tell me to use a oneOf to resolve this, but instead it just ignores any issues. What's going on here? Is this just a fundamental limitation of ajv?

**Are you going to resolve the issue?**
Maybe, depends on the answers to the above