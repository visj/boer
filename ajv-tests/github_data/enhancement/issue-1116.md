# [1116] Should 'integer' type validate bigint ?

This is more of a question than a proposal.

**What problem do you want to solve?**
I want to validate objects containing a bigint.

**What do you think is the correct solution to problem?**
Bigint instance could pass the validation against 'integer' type. This may sound weird as "regular" integer would also pass this validation, and in this way the "type" isn't really validated. But the JSON specifications do not impose a limit on the range of integers.

The other solution would be to extend the types to include BigInt.
Thanks for your answer.
