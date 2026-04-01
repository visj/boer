# [585] Remove compilation of async schemas to generator functions

With async functions generator functions are no longer used for control flow, so they can be dropped. Reasons:
- simplify schema compilation code
- no need for async option
- regenerator bundle will be removed, making #482 not important
- "co" dependency will be removed, making ajv bundle smaller
