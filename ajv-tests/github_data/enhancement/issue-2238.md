# [2238] boolean coerce for URL parameters

Since boolean is able to use **number** form `1` or `0` when enabled `coerceTypes`.
However, for URL parameters validation, the parameters is always a string.
It will be invalid when putting 1 or 0 on URL (`/api?bool=1`) even `coerceTypes` is enabled.

**Requested change:**
Also allow **string** form `"1"` and `"0"` for boolean coerce