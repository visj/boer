# [1152] Returning the detected entity

I'm not yet using ajv, I'm looking around at different libraries.

Let's say I have a complex schema, and I am sending data for validation.  
Is there a way, assuming the validation returned true, to know what path in the schema returned a valid answer?

For example, my schema accepts both WidgetA and WidgetB, I send some widget for validation and as an output I want to know which type of widget I have detected.