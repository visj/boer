# [1258] v7 - deviation from JSON Schema specification

Below is the change of default options and behaviour planned for v7

Any comments and feedback will be great.


## Standard mode

With `strict: false` option Ajv will fully comply with JSON Schema specification:

- Ignore unknown keywords
- Ignore unknown formats
- Allow not defined type keyword in schemas
- Allow multiple non-null types in the same schema object

Option `strict: false` will be equivalent to the combination of several more granular options mentioned in Strict mode section below:

`ignoreUnknownKeywords: true`
`ignoreUnknownFormats: true`
`allowMissingTypes: true`
`allowMultipleTypes: true`

## Strict mode.

By default Ajv will be using strict mode, that is consistent with the existing practice of writing JSON Schemas and minimises the probability of user errors.

### Unknown keywords.

JSON Schema specification says that implementations SHOULD ignore unknown keywords ([section 6.5](https://tools.ietf.org/html/draft-handrews-json-schema-02#section-6.5)). The motivation for that is to increase cross-platform portability of schemas, so that implementations that do not support certain keywords can still do partial validation. 

There are several problems with this approach:
1. Different validation result with the same schema and the same data may lead the the bugs or inconsistent behaviours that are difficult to identify and debug.
2. Typos in keyword may lead to keywords being quietly ignored, requiring extensive test coverage of schemas.

Ajv by default will fail schema compilation when unknown keywords are encountered. Users can explicitly define the keywords that should be allowed and ignored using:

```
ajv.addKeyword(“allowedKeyword”)
```

or

``` 
ajv.addKeyword("allowedKeyword", {
	type: "string"
})
```

If this keyword is only allowed with `type: string`.

This behaviour can be changed with the option `ignoreUnknownKeywords: true`

In the current version, there is an option `strictKeywords: true` which is already used by many users - this will be the default behaviour in v7.


### Formats

TODO

`ignoreUnknownFormats: true` (default is false)

Current version has `unknownFormats: false` option.


### Assertion keywords that constrain only specific data type(s)

JSON Schema specification says ([section 7.6.1](https://tools.ietf.org/html/draft-handrews-json-schema-02#section-7.6.1)) that when keyword applies to a particular data type, and the data type is different, the keyword should be ignored.

This causes mistakes for many users when simple schemas such as:

```json
{
  "properties": {
    "foo": {}
  }
}
```

or

```json
{
  "minLength": 5
}
```

determines as valid any data that is not an object or not a string, accordingly.

By default Ajv will require that when the schema has a keyword that applies to a specific data type, this data type MUST be explicitly required in this schema. So above examples would throw exception during schema compilation, and for these schemas to be accepted, “type” keyword must be added:

```json
{
  "type": "object",
  "properties": {
    "foo": {}
  }
}
```

or

```json
{
  "type": "string",
  "minLength": 5
}
```

Users still can allow null values, either by adding “null” to allowed types or by using non-standard “nullable” modifier (requires “nullable: true” option, already supported in the current version):

```json
{
  "type": ["object", "null"],
  "properties": {
    "foo": {}
  }
}
```

or

```json
{
  "type": "string",
  "nullable": true,
  "minLength": 5
}
```

The above represents common practice of writing JSON schemas; the missing type keyword in almost all cases is an unintended user error, so the default Ajv behaviour will protect from such mistakes.

This behaviour can be changed with `allowMissingTypes: true` (?) option.


### Multiple types

By default Ajv will not allow multiple types in the same schema object, it will only allow a single type or a single type with “null” type (as in the examples in the previous section).

Absolute majority of the schemas do not use multiple types in the same schema object, and instead use unions with anyOf or oneOf keywords.

This behaviour can be changed with `allowMultipleTypes: true` option.

### additionalItems

Without items or with items as schema throws exception.

`allowIgnoredAdditionalItems: true`

[section 9.3.1.2](https://tools.ietf.org/html/draft-handrews-json-schema-02#section-9.3.1.2)


### patternProperties

Patterns in `patternProperties` must not match any of the property names defined in `properties`

`allowMatchingPatternProperties: true`

### enum

Contradicting enum and type

### both maximum and exclusiveMaximum (or minimum and exclusiveMinimum)

### minContains and maxContains without contains

### minContains 0 without maxContains

### contradicting min* and max*

### uniqueItems: false - prohibit / warning?