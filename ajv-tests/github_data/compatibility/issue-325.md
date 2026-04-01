# [325] Module not found: Error: Can't resolve 'nodent' when used in Angular 2 project (browser)

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
4.8.0

**Your code (please use `options`, `schema` and `data` as variables):**

``` javascript
import * as Ajv from 'ajv';

... ...  ...

@Injectable()
export class ValidationService {
  ajv: Ajv.Ajv;

  constructor() {
      this.ajv = Ajv({ allErrors: true, verbose: false });
  }

  public validateSettings(settingsSchema: JsonSchema, settings: SettingsData): ValidationResult {
    let valid = this.ajv.validate(settingsSchema, settings);
    return {
        valid: valid,
        errors: this.ajv.errors
    };
  }
}
```

If I run this in chrome I get:

Module not found: Error: Can't resolve 'nodent' in '/MyProject/projects/client/node_modules/ajv/lib'
resolve 'nodent' in '/MyProject/projects/client/node_modules/ajv/lib'
  Parsed request is a module
  using description file: /MyProject/projects/client/node_modules/ajv/package.json (relative path: ./lib)
    Field 'browser' doesn't contain a valid alias configuration
  after using description file: /MyProject/projects/client/node_modules/ajv/package.json (relative path: ./lib)
    resolve as module
      /MyProject/projects/client/node_modules/ajv/lib/node_modules doesn't exist or is not a directory
      /MyProject/projects/client/node_modules/ajv/node_modules doesn't exist or is not a directory
      /MyProject/projects/client/node_modules/node_modules doesn't exist or is not a directory
      /MyProject/projects/node_modules doesn't exist or is not a directory
      /MyProject/node_modules doesn't exist or is not a directory
      /Users/mmc/repos/node_modules doesn't exist or is not a directory
      /Users/mmc/node_modules doesn't exist or is not a directory
      /Users/node_modules doesn't exist or is not a directory
      /node_modules doesn't exist or is not a directory
      looking for modules in /MyProject/projects/client/node_modules
        using description file: /MyProject/projects/client/package.json (relative path: ./node_modules)
          Field 'browser' doesn't contain a valid alias configuration
        after using description file: /MyProject/projects/client/package.json (relative path: ./node_modules)
          using description file: /MyProject/projects/client/package.json (relative path: ./node_modules/nodent)
            as directory
              /MyProject/projects/client/node_modules/nodent doesn't exist
            no extension
              Field 'browser' doesn't contain a valid alias configuration
              /MyProject/projects/client/node_modules/nodent doesn't exist
            Field 'browser' doesn't contain a valid alias configuration
            /MyProject/projects/client/node_modules/nodent doesn't exist
            .ts
              Field 'browser' doesn't contain a valid alias configuration
              /MyProject/projects/client/node_modules/nodent.ts doesn't exist
            .js
              Field 'browser' doesn't contain a valid alias configuration
              /MyProject/projects/client/node_modules/nodent.js doesn't exist
[/MyProject/projects/client/node_modules/ajv/lib/node_modules]
[/MyProject/projects/client/node_modules/ajv/node_modules]
[/MyProject/projects/client/node_modules/node_modules]
[/MyProject/projects/node_modules]
[/MyProject/node_modules]
[/node_modules]
[/MyProject/projects/client/node_modules/nodent]
[/MyProject/projects/client/node_modules/nodent]
[/MyProject/projects/client/node_modules/nodent]
[/MyProject/projects/client/node_modules/nodent.ts]
[/MyProject/projects/client/node_modules/nodent.js]
 @ ./~/ajv/lib/async.js 116:26-48
 @ ./~/ajv/lib/ajv.js
 @ ./src/app/shared/services/validation-service.ts
 @ ./src/app/app.module.ts
 @ ./src/app/index.ts
 @ ./src/main.ts
 @ multi main

**What results did you expect?**

**Are you going to resolve the issue?**
