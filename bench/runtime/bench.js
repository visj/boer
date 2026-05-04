import fs from 'fs';
import { run, bench, group } from 'mitata';
import Ajv from 'ajv';
import standaloneCode from 'ajv/dist/standalone/index.js';
import * as z from "zod";

import { catalog, CompoundSchema, compile } from 'boer/core';

// Note: Adjust these imports to match exactly where your new schema compiler lives!
// import { CompoundSchema } from '../src/internal/schema.js';
// import { compile } from '../src/internal/ast.js';

// ────────────────────────────────────────────────────────────────────────────
// 1. THE SCHEMA (Strict Draft 7)
// ────────────────────────────────────────────────────────────────────────────
const complexSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["eventId", "timestamp", "user", "device", "metrics", "transactions"],
    "additionalProperties": false,
    "properties": {
        "eventId": {
            "type": "string",
            "pattern": "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
        },
        "timestamp": {
            "type": "string",
            "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$"
        },
        "user": {
            "type": "object",
            "required": ["id", "username", "email", "roles"],
            "properties": {
                "id": { "type": "integer", "minimum": 1 },
                "username": { "type": "string", "minLength": 5, "maxLength": 20, "pattern": "^[a-zA-Z0-9_]+$" },
                "email": { "type": "string", "pattern": "^[^@]+@[^@]+\\.[^@]+$" },
                "roles": {
                    "type": "array",
                    "minItems": 1,
                    "maxItems": 5,
                    "uniqueItems": true,
                    "items": {
                        "type": "string",
                        "enum": ["admin", "moderator", "user", "guest", "tester"]
                    }
                }
            }
        },
        "device": {
            "type": "object",
            "required": ["ip", "userAgent"],
            "properties": {
                "ip": {
                    "type": "string",
                    "anyOf": [
                        { "pattern": "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" }, // IPv4 approx
                        { "pattern": "^(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}$" } // IPv6 approx
                    ]
                },
                "userAgent": { "type": "string", "maxLength": 500 },
                "location": {
                    "type": "object",
                    "required": ["lat", "lon"],
                    "properties": {
                        "lat": { "type": "number", "minimum": -90, "maximum": 90 },
                        "lon": { "type": "number", "minimum": -180, "maximum": 180 }
                    }
                }
            }
        },
        "metrics": {
            "type": "object",
            "required": ["loginCount", "sessionDuration", "bounceRate"],
            "properties": {
                "loginCount": { "type": "integer", "minimum": 0 },
                "sessionDuration": { "type": "number", "exclusiveMinimum": 0 },
                "bounceRate": { "type": "number", "minimum": 0, "maximum": 1 }
            }
        },
        "transactions": {
            "type": "array",
            "maxItems": 100,
            "items": {
                "type": "object",
                "required": ["txId", "amount", "currency", "status"],
                "dependencies": {
                    "refunded": ["refundAmount", "refundReason"] // Draft 7 dependencies!
                },
                "properties": {
                    "txId": { "type": "string", "minLength": 10, "maxLength": 50 },
                    "amount": { "type": "number", "exclusiveMinimum": 0 },
                    "currency": { "type": "string", "enum": ["USD", "EUR", "GBP", "JPY"] },
                    "status": { "type": "string", "enum": ["pending", "completed", "failed", "refunded"] },
                    "tags": {
                        "type": "array",
                        "maxItems": 10,
                        "items": { "type": "string", "maxLength": 20 }
                    },
                    "refunded": { "type": "boolean" },
                    "refundAmount": { "type": "number", "minimum": 0 },
                    "refundReason": { "type": "string", "maxLength": 100 }
                }
            }
        }
    }
};

const ZodOrder = z.fromJSONSchema(complexSchema);

// ────────────────────────────────────────────────────────────────────────────
// 2. THE PAYLOAD (~1.5KB of realistic enterprise data)
// ────────────────────────────────────────────────────────────────────────────
const rawData = {
    eventId: "550e8400-e29b-41d4-a716-446655440000",
    timestamp: "2026-03-26T16:25:56Z",
    user: {
        id: 987654321,
        username: "super_admin_99",
        email: "admin@enterprise.local",
        roles: ["admin", "tester", "user"]
    },
    device: {
        ip: "192.168.1.105",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        location: {
            lat: 34.0522,
            lon: -118.2437
        }
    },
    metrics: {
        loginCount: 42,
        sessionDuration: 3605.5,
        bounceRate: 0.15
    },
    transactions: [
        { txId: "TXN-9823749823", amount: 150.75, currency: "USD", status: "completed", tags: ["digital", "software"] },
        { txId: "TXN-9823749824", amount: 899.99, currency: "EUR", status: "pending", tags: ["hardware", "bulk"] },
        { txId: "TXN-9823749825", amount: 12.50, currency: "GBP", status: "failed", tags: ["subscription"] },
        { txId: "TXN-9823749826", amount: 450.00, currency: "USD", status: "completed", tags: ["consulting"] },
        { txId: "TXN-9823749827", amount: 25.00, currency: "JPY", status: "refunded", refunded: true, refundAmount: 25.00, refundReason: "Customer requested cancellation" },
        { txId: "TXN-9823749828", amount: 1000.00, currency: "USD", status: "completed", tags: ["vip", "expedited"] },
        { txId: "TXN-9823749829", amount: 5.99, currency: "EUR", status: "completed" },
        { txId: "TXN-9823749830", amount: 50.00, currency: "USD", status: "pending", tags: ["giftcard"] }
    ]
};

const jsonStr = JSON.stringify(rawData);

// ────────────────────────────────────────────────────────────────────────────
// 3. COMPILE AJV
// ────────────────────────────────────────────────────────────────────────────
// const ajv = new Ajv({ coerceTypes: false, allErrors: false });
const ajv = new Ajv({
    coerceTypes: false,
    // You must enable source code generation for the standalone feature
    // code: { source: true },
    // If you are using formats, Ajv usually requires 'ajv-formats' plugin,
    // but doing formats: { ... } as simple booleans works for bypassing them.
    formats: { uri: true, 'date-time': true }
});
const ajvValidate = ajv.compile(complexSchema);

// ────────────────────────────────────────────────────────────────────────────
// 4. COMPILE boer
// ────────────────────────────────────────────────────────────────────────────
const cat = catalog();
const { validate } = cat;

const compound = new CompoundSchema("draft-07");
const refIdx = compound.add(complexSchema);
const ast = compound.bundle(refIdx);
const compiled = compile(cat, ast);
const boerRootPtr = compiled[0].schema;

// ────────────────────────────────────────────────────────────────────────────
// 5. THE BENCHMARK
// ────────────────────────────────────────────────────────────────────────────

// Sanity Check: Ensure both engines agree the payload is valid before benchmarking!
if (!ajvValidate(rawData)) {
    console.error("AJV failed validation!", ajvValidate.errors);
    process.exit(1);
}
if (!validate(rawData, boerRootPtr)) {
    console.error("boer failed validation!");
    process.exit(1);
}

if (!ZodOrder.safeParse(rawData).success) { console.error("ZOD failed!"); process.exit(1); }

function theoreticalBaseline(data) {
    if (typeof data === 'string') return true;
    if (typeof data === 'number') return true;
    if (typeof data === 'boolean') return true;
    if (data === null || data === undefined) return true;

    if (Array.isArray(data)) {
        for (let i = 0; i < data.length; i++) {
            if (!theoreticalBaseline(data[i])) return false;
        }
        return true;
    }

    if (typeof data === 'object') {
        for (let key in data) {
            // Standard safety check most parsers do
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (!theoreticalBaseline(data[key])) return false;
            }
        }
        return true;
    }

    return true;
}

group('Enterprise JSON Schema Validation (1.5KB Payload)', () => {

    bench('boer (In-Place Bitwise VM)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) {
                return validate(data, boerRootPtr);
            }
        };
    });

    bench('Ajv (v8) - Draft 7', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { return ajvValidate(data); }
        };
    });

    bench('Recursive Baseline (Theoretical Floor)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { theoreticalBaseline(data); }
        };
    });

    bench('Zod (AST Interpreter)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            // safeParse is equivalent here, avoiding try/catch deopts
            // and returning a pure boolean indicator (success).
            bench(data) { return ZodOrder.safeParse(data).success; }
        };
    });

});

group('Enterprise JSON Schema Validation (1.5KB Payload)', () => {

    bench('Recursive Baseline (Theoretical Floor)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { theoreticalBaseline(data); }
        };
    });

    bench('Zod (AST Interpreter)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            // safeParse is equivalent here, avoiding try/catch deopts
            // and returning a pure boolean indicator (success).
            bench(data) { return ZodOrder.safeParse(data).success; }
        };
    });

    bench('Ajv (v8) - Draft 7', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { return ajvValidate(data); }
        };
    });

    bench('boer (In-Place Bitwise VM)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) {
                return validate(data, boerRootPtr);
            }
        };
    });
});

await run({ colors: true });
