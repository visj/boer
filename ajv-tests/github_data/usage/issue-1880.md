# [1880] addFormat definitions ignored

Hi, in my code (see below) I create the ajv instance in `validation.ts`, and then import that instance into other files. However, I get an error message when calling `validateSchema` from `utils.ts` complaining about a missing format identifier `email` (and indeed, `ajv.formats` returns an empty object). When I add the format in the function `validateSchema` itself it works - but why does it fail when I add the format in `validation.ts`?

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

```
"ajv": "^8.8.2"
```

**Your code**

```javascript
// validation.ts
export const ajv = (new Ajv({
    discriminator: true,
    formats: {
        email: <a valid regex expression>
    }
}))

// utils.ts
import {JSONSchemaType} from "ajv";
import {ajv} from "./validation";

export function validateSchema<T>(
    args: T,
    schema: JSONSchemaType<T>,
) {
    if(!schema.$id) throw Error("id missing")
    const validate = ajv.getSchema(schema.$id) || ajv.compile(schema)
    const isValid = validate(args)
    if(isValid) return {isValid: true as const}
    else {
        return {
            isValid: false as const,
            errors: validate.errors
        }
    }
}

// auth.ts
import {JSONSchemaType} from "ajv";

export interface SignUpArgs {
    firstName: string,
    lastName: string,
    email: string,
}

export const nameSchema: JSONSchemaType<string> = {
    type: "string",
    maxLength: 18,
    minLength: 1,
}

// Error: unknown format "email" ignored in schema at path "#/properties/email" 
export const emailSchema: JSONSchemaType<string> = {
    type: "string",
    format: "email",
    maxLength: 60,
}

export const signUpArgsSchema: JSONSchemaType<SignUpArgs> = {
    type: "object",
    $id: "signUpArgsSchema",
    properties: {
        firstName: nameSchema,
        lastName: nameSchema,
        email: emailSchema
    },
    required: ["firstName", "lastName", "email"],
    additionalProperties: false
}
```

**Validation result, data AFTER validation, error messages**

```
Error: unknown format "email" ignored in schema at path "#/properties/email"

```
