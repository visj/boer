import fs from 'fs';
import { run, bench, group } from 'mitata';
import Ajv from 'ajv';
import * as z from "zod";

import { catalog, CompoundSchema, compile } from '../src/core.js';
import * as inspector from 'node:inspector';

// ────────────────────────────────────────────────────────────────────────────
// 1. THE SCHEMA (Massive B2B Logistics & Fraud Telemetry)
// ────────────────────────────────────────────────────────────────────────────
const complexSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "object",
    "required": ["orderId", "createdAt", "customer", "shipping", "billing", "items", "fulfillment", "payment", "riskAssessment"],
    "properties": {
        "orderId": { "type": "string", "maxLength": 64 },
        "orderType": { "type": "string", "enum": ["B2B", "B2C", "WHOLESALE", "INTERNAL"] },
        "createdAt": { "type": "string", "pattern": "^\\d{4}-\\d{2}-\\d{2}T" },
        "status": { "type": "string", "enum": ["draft", "processing", "shipped", "delivered", "cancelled", "on_hold"] },
        
        "customer": {
            "type": "object",
            "required": ["id", "email"],
            "properties": {
                "id": { "type": "integer" },
                "email": { "type": "string", "maxLength": 255, "pattern": "^[^@]+@[^@]+\\.[^@]+$" },
                "companyName": { "type": "string", "maxLength": 255 },
                "department": { "type": "string" },
                "phone": { "type": "string", "maxLength": 30 },
                "loyaltyTier": { "type": "string", "enum": ["none", "silver", "gold", "platinum", "diamond"] },
                "tags": { 
                    "type": "array", 
                    "maxItems": 50,
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
                "state": { "type": "string" }, 
                "country": { "type": "string", "enum": ["US", "CA", "GB", "AU", "VN", "DE", "FR", "JP", "SG"] },
                "zipCode": { "type": "string", "maxLength": 20 },
                "isResidential": { "type": "boolean" },
                "instructions": { "type": "string", "maxLength": 1000 }
            }
        },

        "billing": {
            "type": "object",
            "required": ["taxId", "address"],
            "properties": {
                "taxId": { "type": "string", "maxLength": 50 },
                "costCenter": { "type": "string", "maxLength": 50 },
                "address": {
                    "type": "object",
                    "required": ["country", "city"],
                    "properties": {
                        "country": { "type": "string", "maxLength": 2 },
                        "city": { "type": "string" }
                    }
                }
            }
        },

        "items": {
            "type": "array",
            "minItems": 1,
            "maxItems": 1000,
            "items": {
                "type": "object",
                "required": ["sku", "name", "quantity", "unitPrice"],
                "properties": {
                    "sku": { "type": "string", "pattern": "^[A-Z0-9-]+$" },
                    "name": { "type": "string" }, 
                    "description": { "type": "string" }, 
                    "quantity": { "type": "integer", "minimum": 1 },
                    "unitPrice": { "type": "number", "minimum": 0 },
                    "discount": { "type": "number", "minimum": 0 },
                    "taxRate": { "type": "number" },
                    "isDigital": { "type": "boolean" },
                    "attributes": {
                        "type": "object",
                        "additionalProperties": { "type": "string" },
                        "maxProperties": 50
                    }
                }
            }
        },

        "fulfillment": {
            "type": "array",
            "maxItems": 100,
            "items": {
                "type": "object",
                "required": ["packageId", "carrier", "status"],
                "properties": {
                    "packageId": { "type": "string", "maxLength": 100 },
                    "carrier": { "type": "string", "enum": ["FEDEX", "UPS", "USPS", "DHL", "INTERNAL"] },
                    "trackingNumber": { "type": "string", "maxLength": 100 },
                    "status": { "type": "string", "enum": ["preparing", "in_transit", "out_for_delivery", "delivered", "exception"] },
                    "estimatedDelivery": { "type": "string" },
                    "weightKg": { "type": "number" },
                    "dimensions": {
                        "type": "object",
                        "properties": {
                            "length": { "type": "number" },
                            "width": { "type": "number" },
                            "height": { "type": "number" }
                        }
                    },
                    "trackingEvents": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "required": ["timestamp", "location", "message"],
                            "properties": {
                                "timestamp": { "type": "string" },
                                "location": { "type": "string" },
                                "message": { "type": "string" },
                                "eventCode": { "type": "string", "maxLength": 20 }
                            }
                        }
                    }
                }
            }
        },

        "payment": {
            "type": "object",
            "required": ["method", "status", "totalAmount", "currency"],
            "properties": {
                "method": { "type": "string", "enum": ["credit_card", "paypal", "stripe", "crypto", "bank_transfer", "net_30"] },
                "status": { "type": "string", "enum": ["pending", "authorized", "captured", "failed", "refunded"] },
                "totalAmount": { "type": "number", "minimum": 0 },
                "taxAmount": { "type": "number", "minimum": 0 },
                "currency": { "type": "string", "maxLength": 3 },
                "transactions": {
                    "type": "array",
                    "items": {
                        "type": "object",
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

        "riskAssessment": {
            "type": "object",
            "properties": {
                "score": { "type": "number", "minimum": 0, "maximum": 100 },
                "level": { "type": "string", "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
                "fraudSignals": {
                    "type": "array",
                    "items": { "type": "string" }
                },
                "deviceFingerprint": { "type": "string" },
                "ipVelocity": { "type": "number" }
            }
        },

        "auditTrail": {
            "type": "array",
            "items": {
                "type": "object",
                "required": ["action", "timestamp", "actor"],
                "properties": {
                    "action": { "type": "string" },
                    "timestamp": { "type": "string" },
                    "actor": { "type": "string" },
                    "ip": { "type": "string", "maxLength": 45 },
                    "details": { "type": "string" }
                }
            }
        },

        "metadata": {
            "type": "object",
            "additionalProperties": { "type": "string" },
            "maxProperties": 200
        }
    }
};

const ZodOrder = z.fromJSONSchema(complexSchema);

// ────────────────────────────────────────────────────────────────────────────
// 2. THE PAYLOAD (~15KB of Deeply Nested Enterprise Data)
// ────────────────────────────────────────────────────────────────────────────
const rawData = {
    orderId: "ORD-2026-9982347-XYZ-B2B",
    orderType: "B2B",
    createdAt: "2026-03-27T10:15:30Z",
    status: "shipped",
    customer: {
        id: 10485739,
        email: "procurement@global-logistics-corp.com",
        companyName: "Global Logistics Corp",
        department: "IT Infrastructure",
        phone: "+1-555-019-8372",
        loyaltyTier: "diamond",
        tags: ["b2b", "high-volume", "net-30", "priority-support", "tax-exempt", "sla-24h", "managed-services"]
    },
    shipping: {
        addressLine1: "1284 Enterprise Blvd",
        addressLine2: "Suite 900, Datacenter Receiving Bay 4",
        city: "Seattle",
        state: "WA",
        country: "US",
        zipCode: "98101",
        isResidential: false,
        instructions: "Requires lift gate. Deliveries only accepted between 08:00 and 16:00 local time. Contact dock manager 30 mins prior."
    },
    billing: {
        taxId: "US-998234792",
        costCenter: "CC-IT-90210",
        address: {
            country: "US",
            city: "San Francisco"
        }
    },
    items: [
        { sku: "SRV-BLD-8902", name: "Enterprise Rackmount Server 2U", description: "Dual socket, 1TB RAM capable.", quantity: 12, unitPrice: 3499.99, discount: 250.00, taxRate: 0, isDigital: false, attributes: { "cpu": "Dual AMD EPYC", "ram": "256GB ECC", "storage": "None", "nic": "Dual 10G", "psu": "Redundant 800W" } },
        { sku: "NET-SW-48P-10G", name: "48-Port 10G Managed Switch", quantity: 6, unitPrice: 1299.00, taxRate: 0, isDigital: false, attributes: { "ports": "48x 10G SFP+", "uplink": "4x 40G QSFP+", "management": "Cloud/Local" } },
        { sku: "CAB-DAC-3M", name: "10G SFP+ Direct Attach Copper Cable - 3m", quantity: 120, unitPrice: 18.50, taxRate: 0, isDigital: false, attributes: { "length": "3m", "color": "Black", "type": "Passive", "awg": "30" } },
        { sku: "CAB-FIBER-LC-10M", name: "OM4 LC-LC Multimode Fiber - 10m", quantity: 50, unitPrice: 22.00, taxRate: 0, isDigital: false, attributes: { "length": "10m", "core": "50/125" } },
        { sku: "UPS-3000VA-RM", name: "3000VA Rackmount UPS", description: "Line-interactive UPS with pure sine wave output.", quantity: 8, unitPrice: 850.00, taxRate: 0, isDigital: false },
        { sku: "PDU-METERED-30A", name: "Metered PDU 30A 208V", quantity: 16, unitPrice: 420.00, taxRate: 0, isDigital: false, attributes: { "input": "L6-30P", "outlets": "20x C13, 4x C19" } },
        { sku: "RACK-CABINET-42U", name: "42U Server Enclosure", quantity: 4, unitPrice: 1100.00, taxRate: 0, isDigital: false, attributes: { "height": "42U", "width": "600mm", "depth": "1070mm", "doors": "Perforated" } },
        { sku: "LIC-CLOUD-ENT-1Y", name: "Cloud Management Enterprise License (1 Year)", quantity: 1, unitPrice: 15000.00, taxRate: 0, isDigital: true, attributes: { "tier": "Enterprise", "duration": "12 Months", "autoRenew": "true", "nodes": "Unlimited" } },
        { sku: "SVC-INSTALL-ONSITE", name: "On-Site Installation Service", quantity: 1, unitPrice: 4500.00, taxRate: 0, isDigital: true, attributes: { "region": "North America", "sla": "48 Hours", "technicians": "2" } },
        { sku: "HD-NVME-4TB-ENT", name: "4TB NVMe Enterprise SSD", quantity: 48, unitPrice: 489.99, taxRate: 0, isDigital: false, attributes: { "formFactor": "U.2", "endurance": "3 DWPD", "encryption": "SED" } },
        { sku: "MEM-DDR5-64GB-ECC", name: "64GB DDR5 ECC RDIMM", quantity: 192, unitPrice: 215.00, taxRate: 0, isDigital: false, attributes: { "speed": "4800MHz", "cas": "CL40", "type": "RDIMM", "voltage": "1.1V" } },
        { sku: "CPU-EPYC-9654", name: "AMD EPYC 9654 96-Core Processor", quantity: 24, unitPrice: 4800.00, taxRate: 0, isDigital: false, attributes: { "cores": "96", "threads": "192", "tdp": "360W" } }
    ],
    fulfillment: [
        {
            packageId: "PKG-992-001-PALLET",
            carrier: "FEDEX",
            trackingNumber: "778923498234",
            status: "in_transit",
            estimatedDelivery: "2026-03-30T17:00:00Z",
            weightKg: 450.5,
            dimensions: { length: 120, width: 100, height: 180 },
            trackingEvents: [
                { timestamp: "2026-03-27T14:00:00Z", location: "Warehouse - Seattle, WA", message: "Shipment data transmitted to FedEx", eventCode: "PU" },
                { timestamp: "2026-03-27T16:30:00Z", location: "Seattle, WA", message: "Picked up", eventCode: "PU" },
                { timestamp: "2026-03-27T20:15:00Z", location: "Kent, WA", message: "Arrived at FedEx location", eventCode: "AR" },
                { timestamp: "2026-03-28T02:45:00Z", location: "Kent, WA", message: "Departed FedEx location", eventCode: "DP" },
                { timestamp: "2026-03-28T18:20:00Z", location: "Memphis, TN", message: "Arrived at FedEx hub", eventCode: "AR" }
            ]
        },
        {
            packageId: "PKG-992-002-PALLET",
            carrier: "FEDEX",
            trackingNumber: "778923498235",
            status: "in_transit",
            estimatedDelivery: "2026-03-30T17:00:00Z",
            weightKg: 420.0,
            dimensions: { length: 120, width: 100, height: 160 },
            trackingEvents: [
                { timestamp: "2026-03-27T14:00:00Z", location: "Warehouse - Seattle, WA", message: "Shipment data transmitted to FedEx", eventCode: "PU" },
                { timestamp: "2026-03-27T16:30:00Z", location: "Seattle, WA", message: "Picked up", eventCode: "PU" },
                { timestamp: "2026-03-27T20:15:00Z", location: "Kent, WA", message: "Arrived at FedEx location", eventCode: "AR" },
                { timestamp: "2026-03-28T02:46:00Z", location: "Kent, WA", message: "Departed FedEx location", eventCode: "DP" }
            ]
        },
        {
            packageId: "PKG-992-003-BOX",
            carrier: "UPS",
            trackingNumber: "1Z9999999999999999",
            status: "delivered",
            estimatedDelivery: "2026-03-28T12:00:00Z",
            weightKg: 12.5,
            dimensions: { length: 40, width: 40, height: 30 },
            trackingEvents: [
                { timestamp: "2026-03-27T10:00:00Z", location: "Seattle, WA", message: "Order Processed: Ready for UPS", eventCode: "BILLING_INFO" },
                { timestamp: "2026-03-27T15:00:00Z", location: "Seattle, WA", message: "Origin Scan", eventCode: "ORIGIN_SCAN" },
                { timestamp: "2026-03-27T21:00:00Z", location: "Seattle, WA", message: "Departure Scan", eventCode: "DEPARTURE" },
                { timestamp: "2026-03-28T05:00:00Z", location: "San Jose, CA", message: "Arrival Scan", eventCode: "ARRIVAL" },
                { timestamp: "2026-03-28T08:00:00Z", location: "San Jose, CA", message: "Out for Delivery", eventCode: "OUT_FOR_DELIVERY" },
                { timestamp: "2026-03-28T11:45:00Z", location: "San Jose, CA", message: "Delivered to Front Desk", eventCode: "DELIVERED" }
            ]
        }
    ],
    payment: {
        method: "net_30",
        status: "authorized",
        totalAmount: 268494.68,
        taxAmount: 0.00,
        currency: "USD",
        transactions: [
            { id: "TXN-PO-AUTH-882", amount: 268494.68, success: true, gatewayResponse: "PO_APPROVED_FINANCE" }
        ]
    },
    riskAssessment: {
        score: 1.2,
        level: "LOW",
        fraudSignals: ["KNOWN_CORPORATE_IP", "MATCHING_BILLING_SHIPPING_COUNTRY", "HISTORIC_PURCHASER"],
        deviceFingerprint: "fprint_8832jd9283jd9283j9283",
        ipVelocity: 0.05
    },
    auditTrail: [
        { action: "ORDER_CREATED", timestamp: "2026-03-27T10:15:30Z", actor: "API_B2B_GATEWAY", ip: "192.168.1.100", details: "Received via EDI integration" },
        { action: "RISK_CHECK_PASSED", timestamp: "2026-03-27T10:15:35Z", actor: "SYS_FRAUD_GUARD", ip: "internal", details: "Score: 1.2" },
        { action: "INVENTORY_RESERVED", timestamp: "2026-03-27T10:16:00Z", actor: "SYS_WMS", ip: "internal", details: "Reserved across 2 warehouses" },
        { action: "PO_APPROVED", timestamp: "2026-03-27T11:00:00Z", actor: "FINANCE_AUTO_BOT", ip: "internal", details: "Credit limit verified. Net-30 terms applied." },
        { action: "PICK_TICKETS_GENERATED", timestamp: "2026-03-27T11:05:00Z", actor: "SYS_WMS", ip: "internal", details: "Tickets 8829, 8830, 8831 printed at SEA-1" },
        { action: "PACKING_COMPLETED", timestamp: "2026-03-27T13:45:00Z", actor: "EMP_8234", ip: "10.0.1.45", details: "Packed into 2 pallets, 1 box" },
        { action: "LABELS_PRINTED", timestamp: "2026-03-27T13:50:00Z", actor: "EMP_8234", ip: "10.0.1.45", details: "FedEx Freight and UPS Ground" },
        { action: "STATUS_UPDATED", timestamp: "2026-03-27T14:00:00Z", actor: "SYS_WMS", ip: "internal", details: "Changed from processing to shipped" }
    ],
    metadata: {
        "salesRep": "j.smith",
        "quoteId": "QT-992384-REV2",
        "procurementSystem": "SAP Ariba",
        "priority": "Critical",
        "projectCode": "PRJ-DC-EXPANSION-Q2",
        "contractId": "CTR-2024-B2B-GLOBAL",
        "slaTier": "Gold",
        "routingPreference": "Least Cost"
    }
};

const jsonStr = JSON.stringify(rawData);

// ────────────────────────────────────────────────────────────────────────────
// 3. COMPILE AJV
// ────────────────────────────────────────────────────────────────────────────
// const ajv = new Ajv({ 
//     coerceTypes: false,
// });
// const ajvValidate = ajv.compile(complexSchema);

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

validate(rawData, uvdRootPtr);

process.exit();

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

group('Massive B2B Logistics Payload (~15KB)', () => {

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

group('Massive B2B Logistics Payload (~15KB) - Reversed', () => {

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

group('Massive B2B Logistics Payload (~15KB) - Reversed', () => {

    bench('Recursive Baseline (Theoretical Floor)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { theoreticalBaseline(data); }
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



});

await run({ colors: true });