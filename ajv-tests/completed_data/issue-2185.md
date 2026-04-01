# [2185] keyword: 'type' message: 'must be array' 

Hi, I am getting an error ```keyword: 'type' message: 'must be array' ```
There is a complete example with schema and code https://github.com/habsfanongit/ajvExample. 
Please note that the example is using pnpm. to use npm delete the pnpm-lock.yaml and run npm install and change the start script in the package.json file to ```npm run build && node dist/src/server.js``` from  ```"start": "pnpm run build && node dist/src/server.js",``` 
**What version of Ajv are you using? Does the issue happen if you use the latest version?**
 "ajv": "^8.11.2" is the latest version

**Ajv options object**
```allErrors: true``` is passed to the ajv constructor
<!-- See https://ajv.js.org/options.html -->

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
    "$schema": "http://json-schema.org/schema#",
    "description": "Post Schema Definition",
    "type": "array",
    "items": {
        "type": "object",
        "properties": {
            "Id": {
                "type": "string",
                "description": "Post ID"
            },
            "PostedBy": {
                "type": "string",
                "description": "Name of poster"
            },
            "category": {
                "type": "string",
                "description": "Post Category"
            },
            "UserName": {
                "type": "string",
                "description": "Name of user"
            },
            "effectiveDate": {
                "type": "string",
                "format": "date",
                "description": "Effective date of the post. Format YYYY-MM-DD"
            },
            "reviewerId": {
                "type": "number",
                "description": "Reviewer ID"
            }
        },
        "required": ["Id", "PostedBy", "category", "UserName","effectiveDate", "reviewerId"]
    }
}


```

**Sample data**
The POST is using VSCode Rest Client Plugin (in the rep under restCall directory)
<!-- Please make it as small as possible to reproduce the issue -->

```json
@url = http://localhost:3000/validate/
 POST {{url}}
 Content-Type: application/json


{
	"items": [{
			"Id": "1",
			"PostedBy": "Jane Doe",
			"category": "Some Category",
			"UserName": "Me",
			"effectiveDate": "2022-09-30",
			"reviewerId": "Mon"
		},
        {
			"Id": "2",
			"PostedBy": "Jon Doe",
			"category": "Category 2",
			"UserName": "Someone else",
			"effectiveDate": "2022-09-30",
			
		}
        
    ]
}
```

**Your code**
```javascript

```
<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

```javascript
import express, {Express,Request, Response} from "express"
import Ajv, { AnySchema } from "ajv";
import addFormats from "ajv-formats";
import Post from "./interfaces/Post";
import { readFileSync } from "fs";

const schemaFile =  readFileSync("./schemas/posts.json", "utf-8");
const app:Express = express();
app.use(express.json());
app.post("/validate",(req:Request, res:Response)=>{
    const schemaObject =JSON.parse(schemaFile)
    const ajv = new Ajv({ allErrors: true});
    addFormats(ajv);
    const isValid = ajv.compile<Post>(schemaObject);
    if(isValid(req.body)){
        console.log("Valid");
        
    }
    else{
        console.log(isValid.errors);
       
    }
    res.end();
});
app.listen(3000, ()=>{
    console.log('running on port 3000');
})
```

**Validation result, data AFTER validation, error messages**
```
{
    instancePath: '',
    schemaPath: '#/type',
    keyword: 'type',
    params: { type: 'array' },
    message: 'must be array'
  }
```

**What results did you expect?**
expect the validation to fail because the request first object of the array ```"reviewerId": "Mon"``` should be a number 
**Are you going to resolve the issue?**
