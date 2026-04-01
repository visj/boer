# [2122] Type checking of common parameters in union type is not working properly

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.11.0 (latest)

**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
{allErrors: true, removeAdditional: true, useDefaults: true}
```

**JSON Schema**

See code example

**Sample data**

Not relevant as it's only related to type checking (ajv validation is working properly)

**Your code**
```ts
import Ajv, {JSONSchemaType} from 'ajv';

const ajv = new Ajv({allErrors: true, removeAdditional: true, useDefaults: true});

type Target = {
    type: 'first' | 'second' | 'third';
    commonParameter: string;
}

type FirstTarget = Target & {
    type: 'first';
    specialParameter: string
}
type SecondTarget = Target & {
    type: 'second';
    specialParameter: string
}
type ThirdTarget = Target & {
    type: 'second';
}

// Here typescript is complaining because specialParamer is not in the common section of the union
var schemaA: JSONSchemaType<FirstTarget | SecondTarget> = {
    type: 'object',
    properties: {
        type: {
            type: 'string'
        },
        commonParameter: {
            type: 'string'
        },
        // If I uncomment those lines, typescript is not complaining anymore
        // specialParameter: {
        //     type: 'string'
        // }
    },
    required: ['type', 'commonParameter'],
    oneOf: [
        {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    const: 'first',
                },
                specialParameter: {
                    type: 'string'
                }
            },
            required: ['type', 'specialParameter']
        },
        {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    const: 'second',
                },
                specialParameter: {
                    type: 'string'
                }
            },
            required: ['type', 'specialParameter']
        }
    ]
}

// Here typescript is not complaining because thridTarget does not contain "specialParameter"
var schemaB: JSONSchemaType<FirstTarget | SecondTarget | ThirdTarget> = {
    type: 'object',
    properties: {
        type: {
            type: 'string'
        },
        commonParameter: {
            type: 'string'
        }
    },
    required: ['type', 'commonParameter'],
    oneOf: [
        {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    const: 'first',
                },
                specialParameter: {
                    type: 'string'
                }
            },
            required: ['type', 'specialParameter']
        },
        {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    const: 'second',
                },
                specialParameter: {
                    type: 'string'
                }
            },
            required: ['type', 'specialParameter']
        },
        {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    const: 'third',
                }
            },
            required: ['type']
        }
    ]
}
```

**Playground Link:** [Provided](https://www.typescriptlang.org/play?#code/JYWwDg9gTgLgBAQQFYDcA0cDeApAygeQDlcBjACwFMQBDAFQE8wKBfOAMyghDgHJrUeAbgBQwkhAB2AZ3j8UcALxwJFAO6JUACkzUANroCiUTlCkAuODCgBXChihUIKCggAmr4DGCS9Fq7YxrKQoAEQo2amtdGHNLGxYAShFhGEYKOFpqKABzCnglTGE4Yss0ix42YFMYHjgAH15g8QlXWoaeGDIq1pESuHEQEEkABSzqEDyKKAsZKGAJbJFmUVSmOAAxKplMnLzFDKzc+AAyLCKS1Ypyyuqhc+KpJhJgPVGoccnpuFn57OFly5wXAUZquHZHfbgvanQp9S7lJqSHr3b5PF66N4fGBTGZWX7-FJpDJdKBgw57JRQk5nOFlRogpF3ZbCFBZb7kKjUBAWPBEUiUGgMJgAHk21Sp9SBDJaVIAfPtYRc6TwIAAjJAgmpoFFgThMWDACixRV9Yrwmmmy3mng-BY8FF9Zjay3FAZDCSYibYr4ml1m5W27L2v3LR3OkoOACO1iqFFcFgA2h00jwMDw3SMxl6pjwALrh4qSCj4NiJh0lX1+61qjUkLXly26iD6rxGiyVv1Kpjthud2ndxp4u0Fvsu5oya5beuj01O3t+x4g9Gez49mdVgNDoPzl2h0dzmdRmMOeNwJOXVONNGvLOfPO9g8ujtW5U1zWpnfFJstw3Gz+m81n3Xa1Aw-dcx0kCd6VBMDwLgR9wMXZ4b3ebMfX-DcBxtLdgzgvc+wQzsj1jU9zxTNMkOXW9vXvEMUVzAkWTZKQORoAAhHkCGIVi6DSUUpwlBpgVBQTiW6OUFRRat1XfEdvymVs-0wq4LT7ECcIfEc+gzD1qJxVTO3UuY7QfFFCOIk9E2TJhL3TLh3RXGj8xRIsSzLP0gP7FSVRkutYL7eSDTbAyZ0AjCXSM35-Lg11IJgSdbi0-ckr7SiUKxfTPNHSKTJi-DO0Iv0LLjKyLwo68MT0qBaN3FKQoi19fOnUdAsUtc4LCmKvIRHC6pncd4ugxk+tq8KHgqxzMrGgDN2M7c8v-QqXWK0jrIoWy0sq1C7wYkM6qy-0sLfPyRq-PUFN-drwM6rrDu80DTs7Abyk6bpopnfK9v-FbSpTXbd3o-4gA)


**Validation result, data AFTER validation, error messages**

Don't hesitate to go to the playground as the error is pretty clear.

**What results did you expect?**

typescript should not complain about the fact that "specialParameter" is not in the common properties of the union

**Are you going to resolve the issue?**