# [1961] Unable to validate a schema from https://www.schemastore.org/json/

<!--
Frequently Asked Questions: https://ajv.js.org/faq.html
Please provide all info and reduce your schema and data to the smallest possible size.

This template is for bug or error reports.
For other issues please see https://ajv.js.org/contributing/
-->

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Latest, 8.11.0
**Ajv options object**

<!-- See https://ajv.js.org/options.html -->

```javascript
  const ajv = new Ajv2019({ allErrors: true, strict: false });
  ajvErrors(ajv);
  const validate = ajv.compile(composeSchema);
```

**JSON Schema**

<!-- Please make it as small as possible to reproduce the issue -->
Available at https://raw.githubusercontent.com/compose-spec/compose-spec/master/schema/compose-spec.json

I have added HTTPS instead of HTTP to the schema

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  version: '3.4',
  services: {
    'beacon-chain': {
      image: 'beacon-chain.lighthouse-prater.dnp.dappnode.eth:0.1.0',
      build: { context: 'beacon-chain', args: { UPSTREAM_VERSION: 'v2.2.0' } },
      volumes: [ 'beacon-data:/root/.lighthouse' ],
      ports: [ '9000/tcp', '9000/udp' ],
      restart: 'unless-stopped',
      environment: {
        BEACON_API_PORT: 3500,
        HTTP_WEB3PROVIDER: 'http://goerli-geth.dappnode:8545',
        CORSDOMAIN: 'http://lighthouse.dappnode',
        CHECKPOINT_SYNC_URL: '',
        EXTRA_OPTS: ''
      }
    },
    valdator: {
      image: 'valdator.lighthouse-prater.dnp.dappnode.eth:0.1.0',
      build: { context: 'valdator', args: { UPSTREAM_VERSION: 'v2.2.0' } },
      restart: 'unless-stopped',
      environment: {
        VALIDATORS_FILE: '/root/.lighthouse/valdators/valdator_definitions.yml',
        PUBLIC_KEYS_FILE: '/public_keys.txt',
        HTTP_WEB3SIGNER: 'http://web3signer.web3signer-prater.dappnode:9000',
        BEACON_NODE_ADDR: 'http://beacon-chain.lighthouse-prater.dappnode:3500',
        GRAFFITI: 'valdating_from_DAppNode',
        SUPERVISOR_CONF: '/etc/supervisor/conf.d/supervisord.conf',
        DEFAULT_VALIDATOR_PUBLIC_KEY: '',
        EXTRA_OPTS: ''
      }
    }
  },
  volumes: { 'beacon-data': {} },
  wrongKey: {}
}
```

**Your code**

<!--
Please:
- make it as small as possible to reproduce the issue
- use one of the usage patterns from https://ajv.js.org/guide/getting-started.html
- use `options`, `schema` and `data` as variables, do not repeat their values here
- post a working code sample in RunKit notebook cloned from https://runkit.com/esp/ajv-issue and include the link here.

It would make understanding your problem easier and the issue more useful to others.
Thank you!
-->

https://runkit.com/pablomendezroyo/6255f60913beb2000928fafb

```javascript
  const ajv = new Ajv2019({ allErrors: true, strict: false });
  ajvErrors(ajv);
  const validate = ajv.compile(composeSchema); // FAILS
  const valid = validate(compose);
```

**Validation result, data AFTER validation, error messages**

```
NOT SUPPORTED: keyword "id", use "$id" for schema ID
```

**What results did you expect?**
Valid schema, wrong validation
**Are you going to resolve the issue?**
No, but happy to contribute
