# [2202] JSONSchemaType<T> fails compilation when T is a generic type

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.12.0

**Your typescript code**

[Playground](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAbzgKQMoHkByqDGALAUxAEMAVATzALgF84AzKCEOAcmICsA3VgKF4IA7AK4sAolyHwEvOHLgAxdOjgBeNvQgRWAGlnyAQgEEASmrYAjYlF28a-YIJgEo9YjmoAFYuQA2EYgATRH05AG0JKQA6JXQAXQAuEPkUuGJfYA8kgGcYKEcAcz0UmgBuULgIySco4xNE5NS5CwgLHLzC4vkyu34YSi8ffyDcQhJzGRSwgmr4RzhIpwa0LFGiMgGAHm8-AMDp2biAPnKe3hwIQVy4MCG9tZIkneHAh+IJiqro2IbJprh+lQkqxWhwCDgYLZ-jcmFRYMACNkkn9oXJ0pkCMiAQNgbl8oICqxaF0mjQSakoAQAI7CYCUwJJMLsDIeVhxclkz6LGC1Uy-CopQGYtig8GQ8kpMCwlwwBFIxqouAtNqIbFAth4wpEznQnX-Sk0ukEBmVVjKtkcvT2XiOZyudzUACyiOyxAKBE2YjgBAAHs5BIFsgtZkcFd7ZkkxOVJXcgk9Y698OsInFTn0BnBndlXe63p7vX6hIHg1JQ+oVtgkyQKFRNlmcx6xEcTvxfZBYHALld4O6YPW3QQ3uZ877-cXuUcABQVGZSGvCsS8ACUSX7uarxE9ZdDKLglJgwiggjDgpxIosYIhUP+UogcNliORAv+s6cWKFuI6BN03pEIEZr4wPOcTEs+TS3LscY3AmbwHHOAzsmBoHQgatL0oyrCAT+rAQS8FoVD0PRAA)

```typescript
import { JSONSchemaType } from 'ajv'

enum Event {
    FOO = 'foo',
    BAR = 'bar',
}

interface Payload {
    [Event.FOO]: {
        alice: string,
    };
    [Event.BAR]: {
        bob: string,
    };
}

type PayloadSchema = {
    [event in Event]: JSONSchemaType<Payload[event]>;
};

const payloadSchema: PayloadSchema = {
    [Event.FOO]: {
        type: 'object',
        properties: {
            alice: { type: 'string' },
        },
        required: ['alice'],
    },
    [Event.BAR]: {
        type: 'object',
        properties: {
            bob: { type: 'string' },
        },
        required: ['bob'],
    },
}

interface Message<E extends Event> {
    event: E;
    payload: PayloadSchema[E];
}

type MessageSchema<E extends Event> = JSONSchemaType<Message<E>>;

export const getMessageSchema = <E extends Event>(
    eventType: E
): MessageSchema<E> => {
    return {
        type: 'object',
        properties: {
            event: { type: 'string', enum: [eventType] },
            payload: payloadSchema[eventType],
        },
        required: ['event', 'payload'],
    };
};
```

**Typescript compiler error messages**

```
Type '{ type: "object"; properties: { payload: PayloadSchema[E]; }; required: "payload"[]; }' is not assignable to type 'MessageSchema<E>'.
  Object literal may only specify known properties, and 'type' does not exist in type 'never'.
```

**Describe the change that should be made to address the issue?**

`JSONSchemaType` should recognize that the type `Message<E>` is an object type.

Adding the following test:

```typescript
type Test<E extends Event> = MessageSchema<E> extends Record<string, any> ? true : false;

export const getMessageSchema = <E extends Event>(
    eventType: E
): MessageSchema<E> => {
    const test: Test<E> = true;
    ...
}
```

reveals that the constraint `MessageSchema<E> extends Record<string, any>` is satisfied, and I expect the branch of `UncheckedJSONSchemaType` that checks `T extends Record<string, any>` to match and result in the schema type for records and dictionaries.

**Are you going to resolve the issue?**

Not yet.