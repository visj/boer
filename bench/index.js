import { run, bench, group } from 'mitata';
import { z } from 'zod';
import * as v from 'valibot';
import { Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import * as p from '../dist/index.mjs';

const rawData = {
    id: 123456,
    createdAt: "2026-03-15T10:10:45Z",
    status: "processing",
    customer: {
        id: 987,
        name: "Justin Mason",
        tags: ["vip", "returning", "tech"],
        preferences: { newsletter: true }
    },
    items: [
        { type: "physical", sku: "KEYBOARD-01", weight: 1.5 },
        { type: "digital", sku: "EBOOK-02", downloadUrl: "https://example.com/download/123" }
    ]
};

const jsonStr = JSON.stringify(rawData);

// --- SCHEMAS ---

const UvdItem = p.union("type", {
    physical: p.object({ sku: p.STRING, weight: p.NUMBER }),
    digital: p.object({ sku: p.STRING, downloadUrl: p.URI })
});

const UvdOrder = p.object({
    id: p.NUMBER,
    createdAt: p.DATE,
    status: p.STRING,
    customer: p.object({
        id: p.NUMBER,
        name: p.STRING,
        tags: p.array(p.STRING),
        preferences: p.object({
            newsletter: p.BOOLEAN,
            sms: p.BOOLEAN | p.UNDEFINED
        })
    }),
    items: p.array(UvdItem)
});

const ZodItem = z.discriminatedUnion("type", [
    z.object({ type: z.literal("physical"), sku: z.string(), weight: z.number() }),
    z.object({ type: z.literal("digital"), sku: z.string(), downloadUrl: z.string().url() })
]);

const ZodOrder = z.object({
    id: z.number(),
    createdAt: z.coerce.date(),
    status: z.string(),
    customer: z.object({
        id: z.number(),
        name: z.string(),
        tags: z.array(z.string()),
        preferences: z.object({
            newsletter: z.boolean(),
            sms: z.boolean().optional()
        })
    }),
    items: z.array(ZodItem)
});

const ValibotItem = v.variant("type", [
    v.object({ type: v.literal("physical"), sku: v.string(), weight: v.number() }),
    v.object({ type: v.literal("digital"), sku: v.string(), downloadUrl: v.pipe(v.string(), v.url()) })
]);

const ValibotOrder = v.object({
    id: v.number(),
    createdAt: v.pipe(v.string(), v.transform((input) => new Date(input))),
    status: v.string(),
    customer: v.object({
        id: v.number(),
        name: v.string(),
        tags: v.array(v.string()),
        preferences: v.object({
            newsletter: v.boolean(),
            sms: v.optional(v.boolean())
        })
    }),
    items: v.array(ValibotItem)
});

const TypeBoxItem = Type.Intersect([
    Type.Object({ type: Type.String() }),
    Type.Union([
        Type.Object({ type: Type.Literal("physical"), sku: Type.String(), weight: Type.Number() }),
        Type.Object({ type: Type.Literal("digital"), sku: Type.String(), downloadUrl: Type.String({ format: 'uri' }) })
    ])
]);

const TypeBoxOrder = Type.Object({
    id: Type.Number(),
    createdAt: Type.String({ format: 'date-time' }),
    status: Type.String(),
    customer: Type.Object({
        id: Type.Number(),
        name: Type.String(),
        tags: Type.Array(Type.String()),
        preferences: Type.Object({
            newsletter: Type.Boolean(),
            sms: Type.Optional(Type.Boolean())
        })
    }),
    items: Type.Array(TypeBoxItem)
});

const ajv = new Ajv({ coerceTypes: false, formats: { uri: true, 'date-time': true } });
const ajvValidate = ajv.compile(TypeBoxOrder);


group('Building schema (Setup time)', () => {
    bench('Zod', function () {
        const ZodItem = z.discriminatedUnion("type", [
            z.object({ type: z.literal("physical"), sku: z.string(), weight: z.number() }),
            z.object({ type: z.literal("digital"), sku: z.string(), downloadUrl: z.string().url() })
        ]);

        const ZodOrder = z.object({
            id: z.number(),
            createdAt: z.coerce.date(),
            status: z.string(),
            customer: z.object({
                id: z.number(),
                name: z.string(),
                tags: z.array(z.string()),
                preferences: z.object({
                    newsletter: z.boolean(),
                    sms: z.boolean().optional()
                })
            }),
            items: z.array(ZodItem)
        });
    });

    bench('uvd (In-Place Bitwise)', function () {
        const UvdItem = p.union("type", {
            physical: p.object({ sku: p.STRING, weight: p.NUMBER }),
            digital: p.object({ sku: p.STRING, downloadUrl: p.URI })
        });

        const UvdOrder = p.object({
            id: p.NUMBER,
            createdAt: p.DATE,
            status: p.STRING,
            customer: p.object({
                id: p.NUMBER,
                name: p.STRING,
                tags: p.array(p.STRING),
                preferences: p.object({
                    newsletter: p.BOOLEAN,
                    sms: p.BOOLEAN | p.UNDEFINED
                })
            }),
            items: p.array(UvdItem)
        });
    });

    bench('Valibot', function () {
        const ValibotItem = v.variant("type", [
            v.object({ type: v.literal("physical"), sku: v.string(), weight: v.number() }),
            v.object({ type: v.literal("digital"), sku: v.string(), downloadUrl: v.pipe(v.string(), v.url()) })
        ]);

        const ValibotOrder = v.object({
            id: v.number(),
            createdAt: v.pipe(v.string(), v.transform((input) => new Date(input))),
            status: v.string(),
            customer: v.object({
                id: v.number(),
                name: v.string(),
                tags: v.array(v.string()),
                preferences: v.object({
                    newsletter: v.boolean(),
                    sms: v.optional(v.boolean())
                })
            }),
            items: v.array(ValibotItem)
        });
    });

    bench('AJV + TypeBox (Theoretical Max)', function () {

        const TypeBoxItem = Type.Intersect([
            Type.Object({ type: Type.String() }),
            Type.Union([
                Type.Object({ type: Type.Literal("physical"), sku: Type.String(), weight: Type.Number() }),
                Type.Object({ type: Type.Literal("digital"), sku: Type.String(), downloadUrl: Type.String({ format: 'uri' }) })
            ])
        ]);

        const TypeBoxOrder = Type.Object({
            id: Type.Number(),
            createdAt: Type.String({ format: 'date-time' }),
            status: Type.String(),
            customer: Type.Object({
                id: Type.Number(),
                name: Type.String(),
                tags: Type.Array(Type.String()),
                preferences: Type.Object({
                    newsletter: Type.Boolean(),
                    sms: Type.Optional(Type.Boolean())
                })
            }),
            items: Type.Array(TypeBoxItem)
        });

        const ajv = new Ajv({ coerceTypes: false, formats: { uri: true, 'date-time': true } });
        const ajvValidate = ajv.compile(TypeBoxOrder);
    });
});

// --- BENCHMARKS ---

group('Pure Parsing (Setup Time Excluded)', () => {

    bench('Zod', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { ZodOrder.parse(data); }
        };
    });

    bench('uvd (In-Place Bitwise)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { p.check(data, UvdOrder); }
        };
    });

    bench('Valibot', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { v.parse(ValibotOrder, data); }
        };
    });

    bench('AJV + TypeBox (Theoretical Max)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { ajvValidate(data); }
        };
    });
});

group('Pure Parsing (Second time after JIT is warmed up)', () => {

    bench('Zod', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { ZodOrder.parse(data); }
        };
    });

    bench('Valibot', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { v.parse(ValibotOrder, data); }
        };
    });

    bench('AJV + TypeBox (Theoretical Max)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { ajvValidate(data); }
        };
    });

    bench('uvd (In-Place Bitwise)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { p.check(data, UvdOrder); }
        };
    });
});

await run({
    colors: true,
    garbage_collection: true,
});