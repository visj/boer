# [2542] Large extra-CPU usage and extra delay when validating, after upgrading from Ajv6 to Ajv8

Hi everyone,

After upgrading Ajv from 6.12.13 Ajv 8.17.1, our system started to crash on validation. We were able to narrow down and isolate the issue, and it looks like Ajv8 is using a lot more CPU/memory than Ajv6 in this specific use case. We wish to have your opinion on it (it could also indicate a leak).


# Here are the reproduction steps:

- We started a virtual machine with "low" memory and cpu (16Gb, 2cpus, running Fedora)
- We have a large schema (see `schema.json`) [schema.json](https://github.com/user-attachments/files/19564063/schema.json)
- We attached a piece of data to be validated (see `data.json`) [data.json](https://github.com/user-attachments/files/19564313/data.json)

- We ran a simple script, that just registers the schema and performs 40.000 validations with the validation function (close to our use case):
```
const ajvInstance = new Ajv({strict: false})
ajvInstance.addSchema(schema, 'some-key')
const validate = ajvInstance.getSchema('some-key')
for (let i = 0; i < 40_000; i++) {
    validate(data)
}
```

# Results:

- When using Ajv6 it takes about 1 second
- When using Ajv8 it takes about 5 seconds
- When looking at the CPU and memory usage, we also see a large extra usage of the CPU (which seems to be causing the crash in production)
- We also noticed it does not matter if the data we pass is valid or not (the sample attached is valid)

We are working on reducing our schemas, but still we think your opinion on this could be interesting, and it may indicate an issue.

Thank you in advance!