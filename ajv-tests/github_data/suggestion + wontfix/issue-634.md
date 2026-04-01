# [634] is making additionalProperties default false possible?

I always use ajv with removeAdditional='all', it works almost all the time for me.  
but I cannot handle the case there is some object in object is free style, and it's content should not removed.

and I don't want to write `additionalProperties=false ` in every schema. so if additionalProperties  is default false, that will work. 

can it be ?