# [199] Schema stacking and resolution chaining?

Hello,

I wonder if it's possible to perform kind of schema stacking, analogous to OOP inheritance. The simplest case is, you add schema under empty ID, and when you compile new validator, any references in compiled schema will first look in that schema, and then in added base schema. Per what I found, reference resolution won't consider local references span to anything other than current schema.

Thanks
