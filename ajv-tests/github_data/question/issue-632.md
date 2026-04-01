# [632] RFE: assign default values within "additionalProperties" schema

I am currently using version 6 (beta).

I want to assign defaults inside "additionalProperties" schema as well as "properties" and "items".  This seems pretty safe to me (not like assigning defaults in "any/oneOf"), since each additional property is just like a specified property except that its name is unknown at the time the schema is prepared.

I looked at ajv/lib/dot/properties.jst but I have not learnt dot yet, so I do not know how much time I would need to implement this.

If this is a bad idea, please tell me so I will not waste time on it.  If you think it is very easy to implement, perhaps you could do so?  If you think it is a good idea but will take some work, tell me any advice you have and I will see if I can implement it.