# [2526] Improvement: Display detailed messages when validation fails

### Discussed in https://github.com/ajv-validator/ajv/discussions/2497

<div type='discussions-op-text'>

<sup>Originally posted by **AM1988** October  4, 2024</sup>
Hi there.

I have a class for data validation
`export class SchemaValidator {
    static ajv = new Ajv({ allErrors: true, verbose: true });

    public static validate<T>(schema: SchemaFile, data: T): boolean {
        const schemaContent = JSON.parse(fs.readFileSync(path.join(__dirname, 'path', schema), 'utf-8'));
        if (!this.ajv.validateSchema(schemaContent)) {
            console.error(`Schema is not valid.`);
        }
        const isValid = this.ajv.validate(schemaContent, data);

        if (!isValid) {
            const errorMessages = this.ajv.errorsText();
            logger.error(`Validation failed : ${errorMessages}`);
            return false;
        }
        return true;
    }
}`
I use JSON schema described in a separate file.
How to get the full output when validation fails so that I can understand which part exactly does not match?

For example, values in the enum did not match, or input data had some additional properties, missing properties, etc.

Right now I see only `data.payload.something should be equal to one of the allowed values`</div>

It does not have info about original data that does not pass schema validation.

It returns messages like
`data.sources[0].version should match pattern "^.{555}$", data.sources[1].version should match pattern "^.{555}$", data.sources[2].version should match pattern "^.{555}$"` but you have no clue what exactly `data.sources[0].version` is.