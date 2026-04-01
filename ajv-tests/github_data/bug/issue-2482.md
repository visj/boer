# [2482] serializing Infinity creates invalid JSON

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
8.17.1

**Ajv options object**
{}

Test case:
```javascript
interface LoudnessMeasurement {
  m: number | null,
  s: number | null,
  g: number | null,
  g_seconds: number
}
const schema: JTDSchemaType<LoudnessMeasurement> = {
  properties: {
    m: { type: "float64", nullable: true },
    s: { type: "float64", nullable: true },
    g: { type: "float64", nullable: true },
    g_seconds: { type: "float64" }
  }
};
const ajv = new Ajv();
let serializer = ajv.compileSerializer(schema);
console.log(serializer({m:-Infinity, s:-12.0, g:null, g_seconds: 420.69}));
```
Result:
```{"m":-Infinity,"s":-12,"g":null,"g_seconds":420.69}```

This JSON is invalid and should instead be:
```{"m":"-Infinity","s":-12,"g":null,"g_seconds":420.69}```
