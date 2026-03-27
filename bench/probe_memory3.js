/**
 * Probe v3: Test when V8 optimization kicks in for _validate.
 * Run many iterations and track when memory spikes occur.
 * This reveals V8's optimization timing for large vs small functions.
 */
import { catalog, CompoundSchema, compile } from '../src/core.js';

const complexSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["eventId", "timestamp", "user", "device", "metrics", "transactions"],
    "additionalProperties": false,
    "properties": {
        "eventId": { "type": "string", "pattern": "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$" },
        "timestamp": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}Z$" },
        "user": { "type": "object", "required": ["id", "username", "email", "roles"], "properties": {
            "id": { "type": "integer", "minimum": 1 },
            "username": { "type": "string", "minLength": 5, "maxLength": 20, "pattern": "^[a-zA-Z0-9_]+$" },
            "email": { "type": "string", "pattern": "^[^@]+@[^@]+\\.[^@]+$" },
            "roles": { "type": "array", "minItems": 1, "maxItems": 5, "uniqueItems": true,
                "items": { "type": "string", "enum": ["admin", "moderator", "user", "guest", "tester"] } }
        }},
        "device": { "type": "object", "required": ["ip", "userAgent"], "properties": {
            "ip": { "type": "string", "anyOf": [
                { "pattern": "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" },
                { "pattern": "^(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}$" }
            ]},
            "userAgent": { "type": "string", "maxLength": 500 },
            "location": { "type": "object", "required": ["lat", "lon"], "properties": {
                "lat": { "type": "number", "minimum": -90, "maximum": 90 },
                "lon": { "type": "number", "minimum": -180, "maximum": 180 }
            }}
        }},
        "metrics": { "type": "object", "required": ["loginCount", "sessionDuration", "bounceRate"], "properties": {
            "loginCount": { "type": "integer", "minimum": 0 },
            "sessionDuration": { "type": "number", "exclusiveMinimum": 0 },
            "bounceRate": { "type": "number", "minimum": 0, "maximum": 1 }
        }},
        "transactions": { "type": "array", "maxItems": 100, "items": {
            "type": "object", "required": ["txId", "amount", "currency", "status"],
            "dependencies": { "refunded": ["refundAmount", "refundReason"] },
            "properties": {
                "txId": { "type": "string", "minLength": 10, "maxLength": 50 },
                "amount": { "type": "number", "exclusiveMinimum": 0 },
                "currency": { "type": "string", "enum": ["USD", "EUR", "GBP", "JPY"] },
                "status": { "type": "string", "enum": ["pending", "completed", "failed", "refunded"] },
                "tags": { "type": "array", "maxItems": 10, "items": { "type": "string", "maxLength": 20 } },
                "refunded": { "type": "boolean" },
                "refundAmount": { "type": "number", "minimum": 0 },
                "refundReason": { "type": "string", "maxLength": 100 }
            }
        }}
    }
};

const rawData = {
    eventId: "550e8400-e29b-41d4-a716-446655440000",
    timestamp: "2026-03-26T16:25:56Z",
    user: { id: 987654321, username: "super_admin_99", email: "admin@enterprise.local", roles: ["admin", "tester", "user"] },
    device: { ip: "192.168.1.105", userAgent: "Mozilla/5.0", location: { lat: 34.0522, lon: -118.2437 } },
    metrics: { loginCount: 42, sessionDuration: 3605.5, bounceRate: 0.15 },
    transactions: [
        { txId: "TXN-9823749823", amount: 150.75, currency: "USD", status: "completed", tags: ["digital", "software"] },
        { txId: "TXN-9823749824", amount: 899.99, currency: "EUR", status: "pending", tags: ["hardware", "bulk"] },
    ]
};

const cat = catalog();
const { validate } = cat;
const compound = new CompoundSchema("draft-07");
const refIdx = compound.add(complexSchema);
const ast = compound.bundle(refIdx);
const compiled = compile(cat, ast);
const uvdRootPtr = compiled[0].schema;

// Run 200 iterations, track which ones spike
let spikes = [];
for (let i = 0; i < 200; i++) {
    global.gc();
    let before = process.memoryUsage().heapUsed;
    validate(rawData, uvdRootPtr);
    let after = process.memoryUsage().heapUsed;
    let delta = after - before;
    if (delta > 1000) {
        spikes.push({ iter: i, delta });
    }
}
console.log('Total spikes > 1KB:', spikes.length);
for (let s of spikes) {
    console.log(`  Iteration ${s.iter}: +${(s.delta / 1024).toFixed(1)} KB`);
}

// Now check V8 optimization status
let fn = validate;
console.log('\n--- V8 Optimization Status ---');
try {
    // %GetOptimizationStatus works with --allow-natives-syntax
    // Without it, we just note that we can't check
    console.log('(Run with --allow-natives-syntax to see V8 status)');
} catch(e) {}
