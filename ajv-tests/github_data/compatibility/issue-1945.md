# [1945] ajv.compile not working in react native but working in react web after v7.0.0  release.

ajv.compile doesn't works on mobile (On web it is working fine) and crashes  the app, looks like it goes in infinite recursion. It was working fine before version 7.0.0

**react: 17.0.2**
**react-native: 0.67.2**
**ajv: 8.11.0**

```
import Ajv from 'ajv';
const ajv = new Ajv();

const IPasswordRecoveryTokenSchema = {
    type: 'object',
    properties: {
        token: { type: 'string' },
        expiresAtMs: { type: 'number' },
    },
    required: ['token', 'expiresAtMs'],
    additionalProperties: false,
};

export const IPasswordRecoveryTokenValidator = ajv.compile(IPasswordRecoveryTokenSchema);

```
**RangeError: Maximum call stack size exceeded (native stack depth), js engine: hermes**
