# [383] change async options

All the logic of choosing the best available async mode/transpiler, also converting "transpile" option as a string to traspilation function will go to a separate package ajv-async.

That will remove optional dependencies on nodent and regenerator.