# [2148] Does JTDSchemaType does support Set<string>?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.11.0

**DTO / JSON Schema**

```javascript
type Foo = {
    name: string;
    bar?: string;
    steps?: Set<string>;
}

const scheme: JTDSchemaType<Foo> = {
     properties: {
         name: {type: 'string'},
     },
     optionalProperties: {
         bar: {type: 'string'},
         steps: {elements: {type: 'string'}}
     },
     additionalProperties: false
};

// The steps line in scheme is failing with Type '{ elements: { type: string; }; }' is not assignable to type 'never'.

```

**What results did you expect?**
I would like to know if we can represent Set<T> types (how?) or if should we use a generic Scheme?
Does JSONSchemaType support Set<T> types?

_A generic scheme is working fine for me, but then I'm losing properties check for the DTO._ 