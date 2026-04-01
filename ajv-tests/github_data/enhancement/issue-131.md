# [131] optimise `not` keyword in `allErrors: true` mode

in `allErrors: true` mode the schema in `not` keyword is collecting all errors if it fails. But `not` will succeed regardless of the number of errors in the schema. So `not` can be improved by returning from schema in it after the first error regardless of `allErrors` setting.

Related to #116
