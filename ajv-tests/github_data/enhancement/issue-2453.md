# [2453] Adding a default additionalProperties: false

**What version of Ajv you are you using?**

8.13.0

**What problem do you want to solve?**

Coming from https://github.com/opensearch-project/opensearch-api-specification/issues/338. 

We are authoring an OpenAPI specification for OpenSearch in https://github.com/opensearch-project/opensearch-api-specification. For example, the [`GET /` API](https://github.com/opensearch-project/opensearch-api-specification/blob/main/spec/namespaces/_core.yaml#L7) returns [server info](https://github.com/opensearch-project/opensearch-api-specification/blob/49cd8140663f32f7c8b638ddc295683344edba61/spec/namespaces/_core.yaml#L2890). To verify that the specification is correct we author test stories. For example [this story](https://github.com/opensearch-project/opensearch-api-specification/blob/49cd8140663f32f7c8b638ddc295683344edba61/tests/_core/info.yaml#L7) makes a `GET /` request to a docker instance of OpenSearch, and we [use AJV](https://github.com/opensearch-project/opensearch-api-specification/blob/49cd8140663f32f7c8b638ddc295683344edba61/tools/src/tester/SchemaValidator.ts#L27) to verify that the response matches the schema. We basically verify the schema from actual server response data, instead of the other way around.

A large category of bugs in the schema is that some fields are missing. For example, the `distribution` filed in the response from `GET /` was added in https://github.com/opensearch-project/opensearch-api-specification/pull/336.

We'd like to have detected the missing field. Had the `info` schema had  `additionalProperties: false` the schema validation would have failed with "data/version must NOT have additional properties". However adding that option means that our published schema cannot be future-proof for when new fields are added. 

So far I am thinking of dynamically injecting `additionalProperties: false` but it feels messy.

**What do you think is the correct solution to problem?**

A way to generically implement the behavior of producing a validation error with any field that is returned in the data but is not referenced in the schema.

```js
validate({ additionalProperties: false })
```

Some other approach?

**Will you be able to implement it?**

No promises, but sincerely appreciate everybody's work on this project! Million thanks. 