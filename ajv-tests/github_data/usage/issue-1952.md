# [1952] Custom keyword modifying data doesn't run during parsing

Hi, I'm trying to parse to a custom type, but running into some issues.


**What version of Ajv are you using? Does the issue happen if you use the latest version?**
`"ajv": "^8.11.0"`

**Ajv options object**


<!-- See https://ajv.js.org/options.html -->

```javascript
const parseDecimalKeyword: KeywordDefinition = {
  keyword: "parseDecimal",
  compile: () => (data, dataCtx: DataValidationCxt) => {
    const parsedDecimal = new BigNumber(data, 10);
    dataCtx.parentData[dataCtx.parentDataProperty] = parsedDecimal;

    return !parsedDecimal.isNaN();
  },
};

const ajv = new Ajv({
  keywords: [parseDecimalKeyword],
});

```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
{
  elements: {
    properties: {
      amount: <any>{
        type: "string",
        metadata: {
          parseDecimal: true,
        },
      },
    },
    additionalProperties: true,
  },
};

```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```javascript
const test = [
      {
        id: 'DeQtD(X%t}',
        creationTime: '2072-12-24T10:35:22.962Z',
        description: '*N)`v1;#M8',
        assetName: 'g+}rw`6zi)',
        amount: '57136.58',
        balance: '81053.34',
        type: 'Withdraw',
        recordType: 'Trade',
        referenceId: '}AEcK*GK*P'
      }
]

```

```javascript
const result = parseBtcMarketsTxsRspData(JSON.stringify(test))!;
  expect(parseBtcMarketsTxsRspData.message).toBeUndefined();
  expect(result).not.toBeUndefined();

  expect(result).toHaveLength(1);
  expect(result[0].amount).toBeInstanceOf(BigNumber);
```

**What results did you expect?**

Based on the examples in https://github.com/ajv-validator/ajv/issues/141 I expect to have the value of amount parsed to a BigNumber object if successful, but it seems like it's still a string.

Btw, it seems like I also have to cast the property object in schema to <any> to satisfy the type checking even though I will be coercing the value from `string` to `BigNumber`. Is there a plan to address this limitation / support this use case?

**Are you going to resolve the issue?**

If there is a more appropriate way to do this, I'm happy to. Right now I have to work around it by using validate() instead of parse() directly.