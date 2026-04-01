# [1813] $ref does not work with array items

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
^8.7.1
**Ajv options object**
[DEFAULT OPTIONS]

```typescript
interface Challenge {
    id: string;
    title: string;
    desc: string;
    profileThumb: string;
    profileMedium: string;
    profileLarger: string;
    coverThumb: string;
    coverMedium: string;
    coverLarger: string;
    isCommerce: boolean;
}

interface Post {
    challenges?: Challenge[];
}

// JSON Schema
const challengeSchema: JSONSchemaType<Challenge> = {
    $id: 'https://example.com/schemas/challenge',
    type: 'object',
    properties: {...},
    required: [...],
};

const postSchema: JSONSchemaType<Post> = {
    $id: 'https://example.com/schemas/post',
    type: 'object',
    properties: {
        challenges: {
            type: 'array',
            nullable: true,
            items: {
                $ref: '/schemas/challenge',
            },
        },
   },
}
```

**Error messages**

Types of property 'items' are incompatible.
Type '{ $ref: string; }' is not assignable to type 'UncheckedJSONSchemaType<Challenge, false>
