import { run, bench, group } from 'mitata';
import { z } from 'zod';
import * as v from 'valibot';
import { Type } from '@sinclair/typebox';
import Ajv from 'ajv';
import { object, union, array, validate, NUMBER, STRING, BOOLEAN, UNDEFINED } from 'boer';
import { catalog, allocators } from 'boer/core';

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

const boerItem = union("type", {
    physical: object({ type: STRING, sku: STRING, weight: NUMBER }),
    digital: object({ type: STRING, sku: STRING, downloadUrl: STRING })
});

const boerOrder = object({
    id: NUMBER,
    createdAt: STRING,
    status: STRING,
    customer: object({
        id: NUMBER,
        name: STRING,
        tags: array(STRING),
        preferences: object({
            newsletter: BOOLEAN,
            sms: BOOLEAN | UNDEFINED
        })
    }),
    items: array(boerItem)
});

const ZodItem = z.discriminatedUnion("type", [
    z.object({ type: z.literal("physical"), sku: z.string(), weight: z.number() }),
    z.object({ type: z.literal("digital"), sku: z.string(), downloadUrl: z.url() })
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
        Type.Object({ type: Type.Literal("digital"), sku: Type.String(), downloadUrl: Type.String() })
    ])
]);

const TypeBoxOrder = Type.Object({
    id: Type.Number(),
    createdAt: Type.String(),
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

const ajv = new Ajv({ coerceTypes: false });
const ajvValidate = ajv.compile(TypeBoxOrder);

const setupCatalog = catalog();
const { object: s_object, union: s_union, array: s_array } = allocators(setupCatalog);

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
        return ZodOrder;
    });

    bench('boer (In-Place Bitwise)', function () {
        const boerItem = s_union("type", {
            physical: s_object({ type: STRING, sku: STRING, weight: NUMBER }),
            digital: s_object({ type: STRING, sku: STRING, downloadUrl: STRING })
        });

        const boerOrder = s_object({
            id: NUMBER,
            createdAt: STRING,
            status: STRING,
            customer: s_object({
                id: NUMBER,
                name: STRING,
                tags: s_array(STRING),
                preferences: s_object({
                    newsletter: BOOLEAN,
                    sms: BOOLEAN | UNDEFINED
                })
            }),
            items: s_array(boerItem)
        });
        return boerOrder;
    });

    bench('Valibot', function () {
        const ValibotItem = v.variant("type", [
            v.object({ type: v.literal("physical"), sku: v.string(), weight: v.number() }),
            v.object({ type: v.literal("digital"), sku: v.string(), downloadUrl: v.string() })
        ]);

        const ValibotOrder = v.object({
            id: v.number(),
            createdAt: v.string(),
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
        return ValibotOrder;
    });

    bench('AJV + TypeBox (Theoretical Max)', function () {

        const TypeBoxItem = Type.Intersect([
            Type.Object({ type: Type.String() }),
            Type.Union([
                Type.Object({ type: Type.Literal("physical"), sku: Type.String(), weight: Type.Number() }),
                Type.Object({ type: Type.Literal("digital"), sku: Type.String(), downloadUrl: Type.String() })
            ])
        ]);

        const TypeBoxOrder = Type.Object({
            id: Type.Number(),
            createdAt: Type.String(),
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

        const ajv = new Ajv({ coerceTypes: false });
        const ajvValidate = ajv.compile(TypeBoxOrder);
        return ajvValidate;
    });
});

// --- BENCHMARKS ---

group('Pure Parsing (Setup Time Excluded)', () => {

    bench('AJV + TypeBox (Theoretical Max)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { ajvValidate(data); }
        };
    });

    bench('Valibot', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { v.parse(ValibotOrder, data); }
        };
    });

    bench('Zod', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { ZodOrder.safeParse(data); }
        };
    });

    bench('boer (In-Place Bitwise)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) {
                validate(data, boerOrder);
            }
        };
    });


});

group('Pure Parsing (Second time after JIT is warmed up)', () => {

    bench('Zod', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { return ZodOrder.safeParse(data).success; }
        };
    });

    bench('Valibot', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { return v.safeParse(ValibotOrder, data).success; }
        };
    });

    bench('AJV + TypeBox (Theoretical Max)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { return ajvValidate(data); }
        };
    });

    bench('boer (In-Place Bitwise)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) {
                return validate(data, boerOrder);
            }
        };
    });
});

group('Pure Parsing (Second time after JIT is warmed up)', () => {

    bench('Zod', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { return ZodOrder.safeParse(data).success; }
        };
    });

    bench('Valibot', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { return v.safeParse(ValibotOrder, data).success; }
        };
    });

    bench('AJV + TypeBox (Theoretical Max)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) { return ajvValidate(data); }
        };
    });

    bench('boer (In-Place Bitwise)', function* () {
        yield {
            [0]() { return JSON.parse(jsonStr); },
            bench(data) {
                return validate(data, boerOrder);
            }
        };
    });
});

await run();
