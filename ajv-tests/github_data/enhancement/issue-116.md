# [116] Implement "contains" (v5) as inline keyword

At the moment it uses macro extension to `{ not: { items: { not: { ... } } }` that has to perform full array scan in all cases, while contains only needs to find the first item that is valid.
