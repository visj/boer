import fs from 'fs';
import { run, bench, group } from 'mitata';
import Ajv from 'ajv';
import * as z from "zod";

import { catalog, CompoundSchema, compile } from '../../dist/core.js';

// ────────────────────────────────────────────────────────────────────────────
// 1. THE SCHEMA (Real-World E-Commerce Checkout)
// ────────────────────────────────────────────────────────────────────────────
const complexSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["orderId", "createdAt", "customer", "shipping", "items", "payment"],
    "properties": {
        "orderId": { "type": "string", "maxLength": 64 },
        "createdAt": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}T" },
        "status": { "type": "string", "enum": ["draft", "processing", "shipped", "delivered", "cancelled"] },
        
        "customer": {
            "type": "object",
            "required": ["id", "email"],
            "properties": {
                "id": { "type": "integer" },
                "email": { "type": "string", "maxLength": 255, "pattern": "^[^@]+@[^@]+\\.[^@]+$" },
                "firstName": { "type": "string" },
                "lastName": { "type": "string" },
                "phone": { "type": "string", "maxLength": 30 },
                "loyaltyTier": { "type": "string", "enum": ["none", "silver", "gold", "platinum"] },
                "marketingOptIn": { "type": "boolean" },
                "tags": { 
                    "type": "array", 
                    "maxItems": 20,
                    "items": { "type": "string", "maxLength": 50 } 
                }
            }
        },

        "shipping": {
            "type": "object",
            "required": ["addressLine1", "city", "country", "zipCode"],
            "properties": {
                "addressLine1": { "type": "string", "maxLength": 150 },
                "addressLine2": { "type": "string", "maxLength": 150 },
                "city": { "type": "string", "maxLength": 100 },
                "state": { "type": "string" }, // No limits, freeform
                "country": { "type": "string", "enum": ["US", "CA", "GB", "AU", "VN", "DE", "FR"] },
                "zipCode": { "type": "string", "maxLength": 20 },
                "isResidential": { "type": "boolean" },
                "shippingMethod": { "type": "string" }
            }
        },

        "items": {
            "type": "array",
            "minItems": 1,
            "maxItems": 500,
            "items": {
                "type": "object",
                "required": ["sku", "name", "quantity", "unitPrice"],
                "properties": {
                    "sku": { "type": "string", "pattern": "^[A-Z0-9-]+$" },
                    "name": { "type": "string" }, // Unconstrained string
                    "description": { "type": "string", "maxLength": 2000 },
                    "quantity": { "type": "integer", "minimum": 1, "maximum": 10000 },
                    "unitPrice": { "type": "number", "minimum": 0 },
                    "discount": { "type": "number", "minimum": 0 },
                    "isDigital": { "type": "boolean" },
                    // Complex Record Type (Testing MOD_RECORD)
                    "attributes": {
                        "type": "object",
                        "additionalProperties": { "type": "string" },
                        "maxProperties": 30
                    }
                }
            }
        },

        "payment": {
            "type": "object",
            "required": ["method", "status", "totalAmount", "currency"],
            "properties": {
                "method": { "type": "string", "enum": ["credit_card", "paypal", "stripe", "crypto", "bank_transfer"] },
                "status": { "type": "string", "enum": ["pending", "authorized", "captured", "failed", "refunded"] },
                "totalAmount": { "type": "number", "minimum": 0 },
                "taxAmount": { "type": "number", "minimum": 0 },
                "currency": { "type": "string", "enum": ["USD", "EUR", "GBP", "VND", "JPY"] },
                "transactions": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "required": ["id", "amount", "success"],
                        "properties": {
                            "id": { "type": "string" },
                            "amount": { "type": "number" },
                            "success": { "type": "boolean" },
                            "gatewayResponse": { "type": "string" }
                        }
                    }
                }
            }
        },

        // Freeform metadata dictionary
        "metadata": {
            "type": "object",
            "additionalProperties": { "type": "string" },
            "maxProperties": 100
        }
    }
};

const ZodOrder = z.fromJSONSchema(complexSchema);

// ────────────────────────────────────────────────────────────────────────────
// 2. THE PAYLOAD (~4KB of Realistic Order Data)
// ────────────────────────────────────────────────────────────────────────────
const rawData = {
    orderId: "ORD-2026-9982347-XYZ",
    createdAt: "2026-03-27T10:15:30Z",
    status: "processing",
    customer: {
        id: 10485739,
        email: "corporate.buyer@megacorp.com",
        firstName: "Jonathan",
        lastName: "Abernathy",
        phone: "+1-555-019-8372",
        loyaltyTier: "platinum",
        marketingOptIn: false,
        tags: ["b2b", "high-volume", "net-30", "priority-support"]
    },
    shipping: {
        addressLine1: "1284 Enterprise Blvd",
        addressLine2: "Suite 900, Logistics Floor",
        city: "Seattle",
        state: "WA",
        country: "US",
        zipCode: "98101",
        isResidential: false,
        shippingMethod: "Next Day Air Freight"
    },
    items: [
        {
            sku: "SRV-BLD-8902",
            name: "Enterprise Rackmount Server 2U",
            description: "Dual socket, 1TB RAM capable, redundant power supplies.",
            quantity: 4,
            unitPrice: 3499.99,
            discount: 250.00,
            isDigital: false,
            attributes: { "cpu": "Dual AMD EPYC", "ram": "256GB ECC", "storage": "None" }
        },
        {
            sku: "NET-SW-48P-10G",
            name: "48-Port 10G Managed Switch",
            quantity: 2,
            unitPrice: 1299.00,
            isDigital: false,
            attributes: { "ports": "48x 10G SFP+", "uplink": "4x 40G QSFP+", "management": "Cloud/Local" }
        },
        {
            sku: "CAB-DAC-3M",
            name: "10G SFP+ Direct Attach Copper Cable - 3m",
            quantity: 40,
            unitPrice: 18.50,
            isDigital: false,
            attributes: { "length": "3m", "color": "Black", "type": "Passive" }
        },
        {
            sku: "UPS-3000VA-RM",
            name: "3000VA Rackmount Uninterruptible Power Supply",
            description: "Line-interactive UPS with pure sine wave output.",
            quantity: 3,
            unitPrice: 850.00,
            isDigital: false
        },
        {
            sku: "LIC-CLOUD-ENT-1Y",
            name: "Cloud Management Enterprise License (1 Year)",
            quantity: 1,
            unitPrice: 5000.00,
            isDigital: true,
            attributes: { "tier": "Enterprise", "duration": "12 Months", "autoRenew": "true" }
        },
        {
            sku: "SVC-INSTALL-ONSITE",
            name: "On-Site Installation and Configuration Service",
            quantity: 1,
            unitPrice: 1500.00,
            isDigital: true,
            attributes: { "region": "North America", "sla": "48 Hours" }
        },
        {
            sku: "HD-NVME-4TB-ENT",
            name: "4TB NVMe Enterprise Solid State Drive",
            quantity: 16,
            unitPrice: 489.99,
            isDigital: false,
            attributes: { "formFactor": "U.2", "endurance": "3 DWPD" }
        },
        {
            sku: "MEM-DDR5-64GB-ECC",
            name: "64GB DDR5 ECC Registered Memory Module",
            quantity: 32,
            unitPrice: 215.00,
            isDigital: false,
            attributes: { "speed": "4800MHz", "cas": "CL40", "type": "RDIMM" }
        }
    ],
    payment: {
        method: "bank_transfer",
        status: "captured",
        totalAmount: 43236.80,
        taxAmount: 3891.31,
        currency: "USD",
        transactions: [
            { id: "TXN-AUTH-001", amount: 43236.80, success: true, gatewayResponse: "AUTH_APPROVED_HOLD" },
            { id: "TXN-CAP-001", amount: 43236.80, success: true, gatewayResponse: "FUNDS_CLEARED_WIRE" }
        ]
    },
    metadata: {
        "salesRep": "j.smith",
        "quoteId": "QT-992384",
        "procurementSystem": "SAP Ariba",
        "priority": "High"
    }
};

const jsonStr = JSON.stringify(rawData);

// ────────────────────────────────────────────────────────────────────────────
// 3. COMPILE AJV
// ────────────────────────────────────────────────────────────────────────────
const ajv = new Ajv({ 
    coerceTypes: false, 
});
const ajvValidate = ajv.compile(complexSchema);

// ────────────────────────────────────────────────────────────────────────────
// 4. COMPILE UVD
// ────────────────────────────────────────────────────────────────────────────
const cat = catalog();
const { validate } = cat;

const compound = new CompoundSchema("draft-07");
const refIdx = compound.add(complexSchema);
const ast = compound.bundle(refIdx);
const compiled = compile(cat, ast);
const uvdRootPtr = compiled[0].schema;

// ────────────────────────────────────────────────────────────────────────────
// 5. THE BENCHMARK
// ────────────────────────────────────────────────────────────────────────────

// Sanity Check
if (!ajvValidate(rawData)) {
    console.error("AJV failed validation!", ajvValidate.errors);
    process.exit(1);
}
if (!validate(rawData, uvdRootPtr)) {
    console.error("UVD failed validation!");
    process.exit(1);
}

if (!ZodOrder.safeParse(rawData).success) { 
    console.error("ZOD failed!"); 
    process.exit(1); 
}

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
            if (Object.prototype.hasOwnProperty.call(data, key)) {
                if (!theoreticalBaseline(data[key])) return false;
            }
        }
        return true;
    }

    return true;
}

group('Large E-Commerce Payload Validation (~4KB)', () => {

    bench('uvd (In-Place Bitwise VM)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { 
                return validate(data, uvdRootPtr);
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
            bench(data) { return ZodOrder.safeParse(data).success; }
        };
    });

});

group('Large E-Commerce Payload Validation (~4KB)', () => {

    bench('Recursive Baseline (Theoretical Floor)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { theoreticalBaseline(data); }
        };
    });

    bench('Zod (AST Interpreter)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { return ZodOrder.safeParse(data).success; }
        };
    });

    bench('Ajv (v8) - Draft 7', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { return ajvValidate(data); }
        };
    });

    bench('uvd (In-Place Bitwise VM)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { 
                return validate(data, uvdRootPtr);
            }
        };
    });

});

await run();
