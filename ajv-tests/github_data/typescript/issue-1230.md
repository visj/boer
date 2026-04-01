# [1230] TypeError: ajv_1.default is not a constructor 

I've been unable to use ajv at all using latest ajv and typescript. I believe this is due to the ts compiler not being happy with the types exported in ajv.d.ts

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
```
// dependencies
    "ajv": "^6.12.2",
    "typescript": "^3.9.3"
//... devDependencies
    "@typescript-eslint/eslint-plugin": "^3.0.1",
    "@typescript-eslint/parser": "^3.0.1",
    "eslint": "^7.1.0",

```


**Ajv options object**
```javascript
import Ajv, {ValidateFunction} from "ajv";

// eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-assignment
const ajv = new Ajv({
  allErrors: true,
});

```
Result:
```
TypeError: ajv_1.default is not a constructor
```

tsconfig.json
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "lib": ["es2015", "es5", "es6", "esnext"],
    "target": "esnext",
    "noImplicitAny": true,
    "moduleResolution": "node",
    "inlineSourceMap": true,
    "rootDirs": ["__test__", "src"],
    "outDir": "build",
    "allowSyntheticDefaultImports": true
  },
  "exclude": [
    "node_modules",
    "deploy"
  ]
}

```

**What results did you expect?**
No typeerrors

**Are you going to resolve the issue?**
no