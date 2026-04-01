# [292] Improve schema compilation speed

At the moment for each schema object ALL keywords are iterated (to group the keywords that apply to the same type and to preserve their order of execution).
This approach is efficient for schemas with many keyword.
As in most cases the majority of schema objects have a small number of keywords, it may be faster to only iterate existing schema object keys (they should be sorted in the same order)
