# [1956] Add a method for generating JSON Schema from Ajv

While developing validation procedures for our data using Ajv we operate with the following things:
- Schemas, created as either **JSON Schema** or as **JSON Type Definition**.
- TypeScript types.

In an ideal world, only **one** of those should be the **source of truth**. Otherwise, we would have to maintain the same structure in two different formats. Yet that's exactly the case with JSON Schema schemas.

## DRY is broken with JSON Schemas
In case of using JSON Schemas what we do is:

1) First, we **manually** create a TypeScript type: `type MyType = {...}`
2) Then we **manually** create the same declaration, but now as a JSON Schema: `const myJSONSchema= {...}`
3) And only then we bind those two to get the input for Ajv: `const mySchema: JSONSchemaType<MyData> = myJSONSchema;`

Now we can use it with Ajv as:
`const validate = ajv.compile(mySchema)`

NOTE that this approach works only if `myJSONSchema` is getting initialized right in your JavaScript code. Be it a separate file, like `my.schema.json`, and we loose the grace of the Ajv's TypeScript integration.

Thus, using JSON Schemas is not the right way, as it basically doubles our work and makes us to support two things instead of just one.

## DRY is OK with JTD
But luckily there is a second way, namely: creating schema as a `JSON Type Definition` (JTD). In this case:

1) First, we **manually** create our schema as JTD (`myJTDSchema`) which becomes our **single source of truth**.
2) And then we get our TypeScript type **automatically**: `type MyType = JTDDataType<typeof myJTDSchema>`

As we were importing `Ajv` from `"ajv/dist/jtd"`, we can now use our JTD schema directly with Ajv as: 
`const validate = ajv.compile<MyType>(myJTDSchema);`

## ...but no JSON Schema
Now that we have decided on the method, we're missing the JSON Schemas themselves. Yet we might really need them for sharing with other parts of our project or with tools like input validators (e.g. [`vscode-yaml` VS Code extension](https://marketplace.visualstudio.com/items?itemName=redhat.vscode-yaml)).

I read the documentation and checked out other Ajv-related projects, but I haven't found a use case with JSON Schema being *generated*. 

It is my understanding that once a Ajv-schema was created and compiled, there must be a way to export it into JSON Schema, as it seems to be a superset over JTD (but this may not be accurate).

## Proposition

I propose to add a method for exporting JSON Schema out of compiled schema. Without this final stroke, the whole picture is falling apart, at least from my perspective. But I can be wrong, sorry for spending your time folks then.

**What version of Ajv you are you using?**

8.11.0

**What problem do you want to solve?**

Generate JSON Schemas from AJV compiled schema for example.

**What do you think is the correct solution to problem?**

Generate JSON Schema.

**Will you be able to implement it?**

No