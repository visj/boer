# [1361] Standalone code generation generates duplicates of validate functions with referenced functions

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

`7.0.1`

**Ajv options object**


```javascript
{
    allErrors: true,
    code: {
      es5: false, // use es6
      lines: true,
      optimize: false, // we'll let rollup do this
      source: true,
    },
    inlineRefs: false,
  }
```

**JSON Schema**

**file:///User.json**:
```js
{
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
    },
    required: ['name'],
  }
```

**file:///B.json**:
```js
{
    type: 'object',
    properties: {
      author: {
        $ref: 'file:///User.json',
      },
      contributors: {
        type: 'array',
        items: {
          $ref: 'file:///User.json',
        },
      },
    },
    required: ['author', 'contributors'],
  }
```

**Sample data**

_Not a data validation issue._

**Your code**

```javascript
//@ts-check
'use strict';

const Ajv = require('ajv').default;
const standaloneCode = require('ajv/dist/standalone').default;

const ajv = new Ajv({
  allErrors: true,
  code: {
    es5: false,
    lines: true,
    optimize: false,
    source: true,
  },
  inlineRefs: false,
  schemas: {
    'file:///User.json': {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
      },
      required: ['name'],
    },
    'file:///B.json': {
      type: 'object',
      properties: {
        author: {
          $ref: 'file:///User.json',
        },
        contributors: {
          type: 'array',
          items: {
            $ref: 'file:///User.json',
          },
        },
      },
      required: ['author', 'contributors'],
    },
  }
});
const code = standaloneCode(ajv);

console.log(code);
```

Note that `function validate21` is included twice in the resulting generated code. This breaks some tools while others are unable to remove the duplicate function.

<details><summary>Resulting code (prettified)</summary><p>

```javascript
"use strict";
exports["file:///User.json"] = validate21;
const schema6 = {
  type: "object",
  properties: { name: { type: "string" } },
  required: ["name"],
};

function validate21(
  data,
  { dataPath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.name === undefined) {
      const err0 = {
        keyword: "required",
        dataPath,
        schemaPath: "#/required",
        params: { missingProperty: "name" },
        message: "should have required property '" + "name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.name !== undefined) {
      let data0 = data.name;
      const _errs0 = errors;
      if (typeof data0 !== "string") {
        const err1 = {
          keyword: "type",
          dataPath: dataPath + "/name",
          schemaPath: "#/properties/name/type",
          params: { type: "string" },
          message: "should be string",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      var valid0 = _errs0 === errors;
    }
  } else {
    const err2 = {
      keyword: "type",
      dataPath,
      schemaPath: "#/type",
      params: { type: "object" },
      message: "should be object",
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate21.errors = vErrors;
  return errors === 0;
}

exports["file:///B.json"] = validate22;
const schema7 = {
  type: "object",
  properties: {
    author: { $ref: "file:///User.json" },
    contributors: { type: "array", items: { $ref: "file:///User.json" } },
  },
  required: ["author", "contributors"],
};

function validate21(
  data,
  { dataPath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.name === undefined) {
      const err0 = {
        keyword: "required",
        dataPath,
        schemaPath: "#/required",
        params: { missingProperty: "name" },
        message: "should have required property '" + "name" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.name !== undefined) {
      let data0 = data.name;
      const _errs0 = errors;
      if (typeof data0 !== "string") {
        const err1 = {
          keyword: "type",
          dataPath: dataPath + "/name",
          schemaPath: "#/properties/name/type",
          params: { type: "string" },
          message: "should be string",
        };
        if (vErrors === null) {
          vErrors = [err1];
        } else {
          vErrors.push(err1);
        }
        errors++;
      }
      var valid0 = _errs0 === errors;
    }
  } else {
    const err2 = {
      keyword: "type",
      dataPath,
      schemaPath: "#/type",
      params: { type: "object" },
      message: "should be object",
    };
    if (vErrors === null) {
      vErrors = [err2];
    } else {
      vErrors.push(err2);
    }
    errors++;
  }
  validate21.errors = vErrors;
  return errors === 0;
}

function validate22(
  data,
  { dataPath = "", parentData, parentDataProperty, rootData = data } = {}
) {
  let vErrors = null;
  let errors = 0;
  if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.author === undefined) {
      const err0 = {
        keyword: "required",
        dataPath,
        schemaPath: "#/required",
        params: { missingProperty: "author" },
        message: "should have required property '" + "author" + "'",
      };
      if (vErrors === null) {
        vErrors = [err0];
      } else {
        vErrors.push(err0);
      }
      errors++;
    }
    if (data.contributors === undefined) {
      const err1 = {
        keyword: "required",
        dataPath,
        schemaPath: "#/required",
        params: { missingProperty: "contributors" },
        message: "should have required property '" + "contributors" + "'",
      };
      if (vErrors === null) {
        vErrors = [err1];
      } else {
        vErrors.push(err1);
      }
      errors++;
    }
    if (data.author !== undefined) {
      let data0 = data.author;
      const _errs0 = errors;
      if (
        !validate21(data0, {
          dataPath: dataPath + "/author",
          parentData: data,
          parentDataProperty: "author",
          rootData,
        })
      ) {
        vErrors =
          vErrors === null
            ? validate21.errors
            : vErrors.concat(validate21.errors);
        errors = vErrors.length;
      } else {
      }
      var valid0 = _errs0 === errors;
    }
    if (data.contributors !== undefined) {
      let data1 = data.contributors;
      const _errs1 = errors;
      if (Array.isArray(data1)) {
        const len0 = data1.length;
        for (let i0 = 0; i0 < len0; i0++) {
          let data2 = data1[i0];
          const _errs2 = errors;
          if (
            !validate21(data2, {
              dataPath: dataPath + "/contributors/" + i0,
              parentData: data1,
              parentDataProperty: i0,
              rootData,
            })
          ) {
            vErrors =
              vErrors === null
                ? validate21.errors
                : vErrors.concat(validate21.errors);
            errors = vErrors.length;
          } else {
          }
          var valid1 = _errs2 === errors;
        }
      } else {
        const err2 = {
          keyword: "type",
          dataPath: dataPath + "/contributors",
          schemaPath: "#/properties/contributors/type",
          params: { type: "array" },
          message: "should be array",
        };
        if (vErrors === null) {
          vErrors = [err2];
        } else {
          vErrors.push(err2);
        }
        errors++;
      }
      var valid0 = _errs1 === errors;
    }
  } else {
    const err3 = {
      keyword: "type",
      dataPath,
      schemaPath: "#/type",
      params: { type: "object" },
      message: "should be object",
    };
    if (vErrors === null) {
      vErrors = [err3];
    } else {
      vErrors.push(err3);
    }
    errors++;
  }
  validate22.errors = vErrors;
  return errors === 0;
}
```

</p></details>

**Validation result, data AFTER validation, error messages**

_N/A_

**What results did you expect?**

I expected each validation function to be included exactly once.

**Are you going to resolve the issue?**

I'm trying to wrap my head around the codegen but am unlikely to be able to handle this.