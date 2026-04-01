# [1453] Change validate, compile and getSchema signatures in JTD instance

I am not sure if it is possible to have different method signatures in the subclasses without having them in a superclass. If it were possible then core class would have no type-guard methods and Ajv class and JTD class would respectively use JSONSchemaType and JTDSchemaType.

It is possible of course by defining methods in the subclasses and calling a super-class method, but it creates an additional function call only to change type signature.

A better alternative would be to simply add type signatures to the core class to support JTDSchemaType in addition to JSONSchemaType.

@erikbrinkman - any thoughts?