/**
 * Minimal memory probe v2: pre-create data objects to isolate pure validation cost.
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
                    "type": "array", "minItems": 1, "maxItems": 5, "uniqueItems": true,
                    "items": { "type": "string", "enum": ["admin", "moderator", "user", "guest", "tester"] }
                }
            }
        },
        "device": {
            "type": "object",
            "required": ["ip", "userAgent"],
            "properties": {
                "ip": { "type": "string", "anyOf": [
                    { "pattern": "^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$" },
                    { "pattern": "^(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}$" }
                ]},
                "userAgent": { "type": "string", "maxLength": 500 },
                "location": { "type": "object", "required": ["lat", "lon"], "properties": {
                    "lat": { "type": "number", "minimum": -90, "maximum": 90 },
                    "lon": { "type": "number", "minimum": -180, "maximum": 180 }
                }}
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
            "type": "array", "maxItems": 100,
            "items": {
                "type": "object",
                "required": ["txId", "amount", "currency", "status"],
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
            }
        }
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

// Setup
const cat = catalog();
const { validate } = cat;
const compound = new CompoundSchema("draft-07");
const refIdx = compound.add(complexSchema);
const ast = compound.bundle(refIdx);
const compiled = compile(cat, ast);
const uvdRootPtr = compiled[0].schema;

// Check what typedef types are in the SLAB for objects
const heap = cat.__heap;
const SLAB = heap.HEAP.SLAB;
const SHAPES = heap.HEAP.SHAPES;
const KINDS = heap.HEAP.KINDS;

// Look at the root type and find inline types
function inspectType(td, depth) {
    let prefix = '  '.repeat(depth);
    if (td === 0) return;
    if (td & 1) {
        // COMPLEX
        let ptr = td >>> 3;
        let header = KINDS[ptr];
        let ri = KINDS[ptr + 1];
        let ct = header & 0x0F;
        console.log(`${prefix}COMPLEX ct=${ct} ptr=${ptr} ri=${ri} header=0x${header.toString(16)}`);
    } else if (td > 0xFF) {
        // Inline type
        let mod = (td >>> 8) & 1;
        let modType = (td >>> 9) & 3;
        let prim = td & 0xF8;
        console.log(`${prefix}INLINE td=0x${td.toString(16)} mod=${mod} modType=${modType} primBits=0x${prim.toString(16)}`);
    } else {
        console.log(`${prefix}BARE td=0x${td.toString(16)}`);
    }
}

console.log('\n=== Root type ===');
inspectType(uvdRootPtr, 0);

// Pre-create multiple data copies to avoid allocation from data creation
let copies = [];
for (let i = 0; i < 20; i++) {
    copies.push(JSON.parse(JSON.stringify(rawData)));
}

console.log('\n=== Pure validation memory (no data creation) ===');
global.gc();
for (let i = 0; i < 20; i++) {
    global.gc();
    let before = process.memoryUsage().heapUsed;
    let result = validate(copies[i], uvdRootPtr);
    global.gc();
    let after = process.memoryUsage().heapUsed;
    console.log(`Call ${i + 1}: result=${result}, delta=${after - before} bytes`);
}
