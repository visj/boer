# [896] Uncaught (in promise): TypeError: Cannot read property 'json' of undefined --- while using compileAsync

```
import * as Ajv from 'ajv';
import { request } from 'request';
 
 ajv: any = new Ajv({loadSchema: this.loadSchema});

 this.ajv.compileAsync(this.schema).then(
    (validate) => {
      this.valid = validate(this.data);
      console.log(validate.schema);
    });
  }

  loadSchema(uri){
    return request.json(uri).then( //error is pointing here...
      (res) => {
        if (res.satusCode >= 400){
          throw new Error('Loading Error: ' + res.satusCode);
        }
        return res.body;
      }
    )
  }
```
Can you tell me where am i mistaking...