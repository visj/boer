# [393] Simplify generated code for "side-effects only" custom keywords

See https://github.com/epoberezkin/ajv/issues/141#issuecomment-270777250

If keyword always returns the same validation result and is used for side-effects (mutating data, logging, accumulation, updating errors, etc.) passing validation result via keyword definition (`valid: true/false`) would both simplify the keyword function (no need to return true) and substantially simplify the generated code - e.g., no need to define/return error that is only used in case validation fails.