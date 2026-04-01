# [197] only iterate over own properties

Please excuse me if I'm missing some crucial option, but it seems like the generated code for the validator iterates over enumerable types (`for (var d in data) { ... }`) whereas I would like to restrict that to only own types (the same as `Object.keys`). Is it possible to tweak the generated validator to accommodate this?
