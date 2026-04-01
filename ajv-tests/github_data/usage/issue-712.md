# [712] Enum works weird on arrays

I need to check if array contains trusted values.

Normally it looks like I need to check `[1, 2, 3]` against `{enum: [1, 2, 3, 4, 5] }`.

But it doesn't work this way, I have to wrap it to `{ contains: {enum: [1, 2, 3, 4, 5] }}` which looks like an extra effort.

Also `contains` can't work with optional arrays.