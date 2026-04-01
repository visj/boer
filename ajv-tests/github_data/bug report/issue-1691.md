# [1691] JTD Serializer does not serialize date objects to string when using type 'timestamp'

I am experiencing an issue with serialization and parsing of JTD schemas which contain a 'timestamp' type.
When I serialize an object which contains a property of type 'Date' as a 'timestamp', the resulting JSON string contains the date in 
RFC3339 format, but not enclosed in quote signs ('"'). This leads to the fact that the parser is not able to parse the JSON string.

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
I am using the latest version ajv@8.6.1

**Ajv options object**
I am using the default options:
```typescript
const ajv = new Ajv();
```
But I have also tried the following JTD specific options:
```typescript
const ajvConfig: JTDOptions = {
    timestamp: 'date' // also tried 'string',
    parseDate: true, // also tried false
};
const ajv = new Ajv(ajvConfig);
```

**JSON Schema**
A minimal example is given as follows:

```json
{
    "properties": {
        "foo": { "type" : "timestamp" }
    }
}
```

**Sample data**

I am expecting the serializer to produce a JSON string as follows (notice the date is enclosed in quote signs):
```json
{
    "foo": "2021-07-15T14:41:09.801Z"
}
```

**Your code**

```javascript
const Ajv = require("ajv/dist/jtd");
const ajv = new Ajv();

const schema = {
  properties: {
    foo: {type: "timestamp"},
  },
};

const data = {foo: new Date()};

const serializer = ajv.compileSerializer(schema);
const parser = ajv.compileParser(schema);

const json = serializer(data);
console.log(json);

const parsedData = parser(json); // error happens here
console.log(parser.message);
console.log(parser.position);
```
The code can be found at [Runkit](https://runkit.com/kantic/60f04f7ac84966001a89002c).


**Validation result, data AFTER validation, error messages**

The JSON string produced by the serializer looks as follows:
```javascript
'{"foo":2021-07-15T15:21:00.322Z}'
```

The parser shows the following message:
"unexpected token 2" (at position 7).
Note that position 7 is the first digit of the date.

**What results did you expect?**

I expect the serializer to produce a JSON string in which the date is quoted:
```javascript
'{"foo":"2021-07-15T15:21:00.322Z"}'
```
If I manually quote the date, the parser does not complain and no error occurs.

**Are you going to resolve the issue?**
No