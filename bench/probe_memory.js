/**
 * Minimal memory probe: isolate which function causes first-run memory spike.
 *
 * Strategy: measure heap before/after the first validation call vs subsequent calls.
 * Also test with master's function shapes (small _validate) vs branch's (large _validate).
 */
import { catalog, CompoundSchema, compile } from '../src/core.js';

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
                        { "pattern": "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" },
                        { "pattern": "^(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}$" }
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
                    "refunded": ["refundAmount", "refundReason"]
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
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        location: { lat: 34.0522, lon: -118.2437 }
    },
    metrics: {
        loginCount: 42,
        sessionDuration: 3605.5,
        bounceRate: 0.15
    },
    transactions: [
        { txId: "TXN-9823749823", amount: 150.75, currency: "USD", status: "completed", tags: ["digital", "software"] },
        { txId: "TXN-9823749824", amount: 899.99, currency: "EUR", status: "pending", tags: ["hardware", "bulk"] },
    ]
};

// Setup
const cat = catalog();
const { validate } = cat;
const compound = new CompoundSchema("draft-07");
const refIdx = compound.add(complexSchema);
const ast = compound.bundle(refIdx);
const compiled = compile(cat, ast);
const uvdRootPtr = compiled[0].schema;

// Print what inline types were created
const heap = cat.__heap;
console.log('ENUMS count:', heap.ENUMS.length);
console.log('CONSTANTS count:', heap.CONSTANTS.length);
console.log('REGEX_CACHE count:', heap.REGEX_CACHE.length);

// Now do memory measurements
function measureCall(label) {
    global.gc();
    let before = process.memoryUsage().heapUsed;
    let result = validate(JSON.parse(JSON.stringify(rawData)), uvdRootPtr);
    let after = process.memoryUsage().heapUsed;
    let delta = after - before;
    console.log(`${label}: result=${result}, heap delta=${delta} bytes`);
}

// Run multiple times to see the spike pattern
for (let i = 0; i < 10; i++) {
    measureCall(`Call ${i + 1}`);
}
