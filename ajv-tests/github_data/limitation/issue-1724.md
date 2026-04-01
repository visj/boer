# [1724] JTD schemas do not support coerceTypes option

I'm using TypeScript v4.3.4 and I am unable to use the `coerceTypes` option when constructing the Ajv instance.

```typescript
import Ajv from 'ajv/dist/jtd';

const ajv = new Ajv({ coerceTypes: true });
```

This is a screenshot of the error I get in VSCodium v1.57.1:

![Bildschirmfoto von 2021-06-28 09-13-51](https://user-images.githubusercontent.com/568497/123595624-6b2af680-d7f1-11eb-84f0-9c4431399d1e.png)
