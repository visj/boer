# [1324] JSONSchemaType should not require declaring methods in the schema

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

7 beta.

**Ajv options object**

Happens before I use the AJV API.  In actual project, I'm using 

```javascript
{
	strict: true,
	allErrors: true,
	useDefaults: false,
	messages: true,
	verbose: true,
	removeAdditional: 'all',
}
```

**JSON Schema**

I've uploaded the 5 minimal classes to reproduce the problem to this gist along with build files (package.json and tsonfig.json):
https://gist.github.com/Arakade/75c57697a4b6cb6fe322d46a2109c78a

**Sample data**

See reproduction.

**Your code**

See reproduction.

**Validation result, data AFTER validation, error messages**

```
TS2741: Property 'run' is missing in type '{ command: { default: "RegisterGame"; enum: "RegisterGame"[]; type: "string"; }; joinCode: { description: string; minimum: number; type: "integer"; }; }' but required in type 'PropertiesSchema<MessageA>'.
```

I also sometimes get variants of confusing messages depending on which bits I include/remove (split over a few lines to make reading easier):

```
Error:(10, 13) TS2322:

Type '{ default: "RegisterGame"; enum: "RegisterGame"[]; type: "string"; }'
 is not assignable to
type '{ $ref: string; } | ({ type: "string"; minLength?: number; maxLength?: number; pattern?: string; format?: string; } & { [keyword: string]: any; $id?: string; $ref?: string; $defs?: { [key: string]: JSONSchemaType<Known, true>; }; ... 7 more ...; not?: Partial<...>; } & { ...; })'.

Type '{ default: "RegisterGame"; enum: "RegisterGame"[]; type: "string"; }'
 is not assignable to
type '{ type: "string"; minLength?: number; maxLength?: number; pattern?: string; format?: string; } & { [keyword: string]: any; $id?: string; $ref?: string; $defs?: { [key: string]: JSONSchemaType<Known, true>; }; ... 7 more ...; not?: Partial<...>; } & { ...; }'.

Property 'nullable' is missing in type '{ default: "RegisterGame"; enum: "RegisterGame"[]; type: "string"; }' but required in type '{ nullable: true; const?: never; enum?: "RegisterGame"[]; default?: "RegisterGame"; }'.
```

**What results did you expect?**

I would expect the supplied code would compile fine with or without `MessageA.run()` declared however when you uncomment it, the message above is shown.  In the real project, when I try applying `@ts-ignore` to the `properties`, (a) obviously I lose some TS benefits and (b) the `run` method fails to invoke at runtime with `TypeError: message.run is not a function` (probably due to having `removeAdditional:all` and `additionalProperties: false` causing it to be deleted!).

**Are you going to resolve the issue?**

Recommendations welcome!