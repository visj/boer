# [1679] Howto combine two JTD schemas

**What version of Ajv are you using?**

v8.6.0

**Ajv options object**

```typescript
const ajv = new Ajv();
ajv.addKeyword(format);
ajvFormats(ajv, ['email']);
```

**JTD Schema**

```typescript
interface IFoo {
    name: string;
    email: string;
    tags?: string[];
    age?: number;
    price: IBar;
};

interface IBar {
    label: string;
    price: number;
}

const venueSchema: JTDSchemaType<IFoo> = {
    properties: {
        name: { type: 'string' },
        email: {
            type: 'string',
            metadata: { format: 'email' },
        },
        price: { // This should come from another definition that is based on `IBar` interface
            properties: {
                label: { type: 'string' },
                price: { type: 'float32' },
            },
        },
    },
    optionalProperties: {
        tags: { elements: { type: 'string' } },
        age: { type: 'uint8' },
    },
};
```

**Sample data**

```json
{
    "name": "John Doe",
    "email": "john@doe.org",
    "tags": ["foo", "bar"],
    "price": {
        "label": "foobar",
        "price": 23,
    },
    "age": 30,
};
```
Disclaimer: I'm a complete noob regarding JSON Schema. I think I have a fair understanding of what JSON Schema does and why it's important. I'm a huge fan of TypeScript and when using JTD I have type safe schemas as well - perfect.

Now I'm trying to get myself familiar with AJV and JTD and want to introduce it to my codebase. I have some complex models (well, nothing fancy like the recursive tree examples on the AJV website, but some nested properties). Currently I want to know how to merge two JTD schemas so that schema A can reference schema B. In the example above the `IFoo` interface has a property `price` that is of type `IBar`.
How can I have a standalone JTD for `IBar` and include that in the JTD for `IFoo`? The documentation says to use JavaScript to do that, and maybe I'm just blind but I don't see how to do that. Any help is greatly appreciated.  