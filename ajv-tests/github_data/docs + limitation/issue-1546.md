# [1546] Compile does not throw exception when unknown keyword is used in schema definition that is not referred to in the schema

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Latest 8.0.5

**Ajv options object**

Default

**JSON Schema**

Snippet embedded in test suite below

**Sample data**

No data just schema validation.

**Your code**

[Code on RunKit](https://runkit.com/wardog/ajv) with contents of 3rd test case that should raise error. Entire test suite is below. All three tests should succeed. The first two succeed but the third fails.

```javascript
// note draft 2019
const Ajv = require('ajv/dist/2019');

describe('Ajv behavior tests', () => {
  it('Schema with definitions should compile', () => {
    const ajv = newAjv();
    const schema = {
      $id: 'https://example.com/test/schema/1.0.0/',
      $schema: 'https://json-schema.org/draft/2019-09/schema#',
      type: 'object',
      definitions: {
        A: {
          type: 'integer',
        },
      },
    }

    expect(ajv.compile(schema)).not.toBeUndefined();
  });

  it('Schema with definitions but unknown "foo" keyword should fail', () => {
    const ajv = new Ajv();
    const schema = {
      $id: 'https://example.com/test/schema/1.0.0/',
      $schema: 'https://json-schema.org/draft/2019-09/schema#',
      type: 'object',
      foo: 'bar',
      definitions: {
        A: {
          type: 'integer',
        },
      },
    }

    expect(() => {
      ajv.compile(schema);
    }).toThrow(new Error('strict mode: unknown keyword: "foo"'));
  });

  it('Schema with definitions but unknown "foo" keyword in definition A should fail', () => {
    const ajv = new Ajv();
    const schema = {
      $id: 'https://example.com/test/schema/1.0.0/',
      $schema: 'https://json-schema.org/draft/2019-09/schema#',
      type: 'object',
      definitions: {
        A: {
          type: 'integer',
          foo: 'bar',
        },
      },
    }

    expect(() => {
      ajv.compile(schema);
    }).toThrow(new Error('strict mode: unknown keyword: "foo"'));
  });
});
```

**What results did you expect?**

I expected the 3rd test case to fail saying that it did not recognize keyword `foo`.

