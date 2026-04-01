# [1151] Typescript test fails (npm script test-ts)

Typescript test (npm script `test-ts`) started to fail with these errors:

```
node_modules/@types/node/globals.d.ts(859,38): error TS2304: Cannot find name 'ReadonlySet'.
node_modules/@types/node/globals.d.ts(993,14): error TS2304: Cannot find name 'MapConstructor'.
node_modules/@types/node/globals.d.ts(998,25): error TS2693: 'Promise' only refers to a type, but is being used as a value here.
node_modules/@types/node/globals.d.ts(1002,14): error TS2304: Cannot find name 'SetConstructor'.
node_modules/@types/node/globals.d.ts(1012,18): error TS2304: Cannot find name 'WeakMapConstructor'.
node_modules/@types/node/globals.d.ts(1013,18): error TS2304: Cannot find name 'WeakSetConstructor'.
node_modules/@types/node/perf_hooks.d.ts(275,31): error TS2304: Cannot find name 'Map'.
node_modules/@types/node/stream.d.ts(24,35): error TS2304: Cannot find name 'Iterable'.
node_modules/@types/node/url.d.ts(94,38): error TS2304: Cannot find name 'Iterable'.
node_modules/@types/node/url.d.ts(95,106): error TS2304: Cannot find name 'Iterable'.
node_modules/@types/node/url.d.ts(108,17): error TS2339: Property 'iterator' does not exist on type 'SymbolConstructor'.
```

It is currently removed from travis test, but needs to be fixed & re-enabled.

