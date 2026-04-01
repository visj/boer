# [608] Improve uniqueItems algorithm for scalars of the same type

Unique items check uses inefficient algorithm with two nested for loops. I have 20k lines schema and I am validating array with 60000 entries.