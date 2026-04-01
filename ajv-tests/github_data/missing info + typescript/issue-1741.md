# [1741] TypeScript Issue with JTDSchema and Elements Properties

When trying to specify a simple schema with an array of strings TypeScript produces a TypeScript compilation error. The same schema run in plain javascript works correctly.

<img width="696" alt="Screen Shot 2021-08-25 at 1 26 24 PM" src="https://user-images.githubusercontent.com/1316152/130837153-59c9ca28-5a75-4c31-b231-a8db13babc92.png">


**What version of Ajv are you using? Does the issue happen if you use the latest version?**

Ajv 8.6.2

TypeScript 4.3.5

**Ajv options object**

```typescript
import Ajv, { JTDSchemaType } from 'ajv/dist/jtd'

const ajv = new Ajv()
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```typescript
interface Schema {
  x: Date
  y: [string]
}

const schema: JTDSchemaType<Schema> = {
  properties: {
    x: { type: 'timestamp' },
    y: {
      elements: { type: 'string' }
    }
  }
}
```

**Your code**

```typescript
import Ajv, { JTDSchemaType } from 'ajv/dist/jtd'

const ajv = new Ajv()

interface Schema {
  x: Date
  y: [string]
}

const schema: JTDSchemaType<Schema> = {
  properties: {
    x: { type: 'timestamp' },
    y: {
      elements: { type: 'string' }
    }
  }
}

ajv.compile(schema)
```