# [291] Extend format keyword to support all data types

The readme currently indicates that custom format validation is only applied to string properties. However my understanding from reading the draft 4 specifications is that any property could have a format attribute, it just so happens that all the predefined formats only apply to strings.

I have not (yet) checked if your implementation does indeed only support custom formats for strings and not other types, but that is what is currently stated in the readme. As noted in another issue, the readme currently broken/out of date in some other places, so perhaps this information is incorrect, however assuming it is correct, ideally when defining custom format validation functions you should be allowed to specifying the type they apply to.

There are many use cases for applying formats to other property types, some examples may be found even in software linked/recommend by the main json schema website.

I have several possible use cases for custom formats on other types in upcoming projects. For example on objects, the custom format matcher "isA:\w_" could trigger a custom format validation function to verify that the object represents data serialized from a class derived from the class matched by "\w_". While in theory this could be achieved with features such as "oneOf", that would assume the schema must know all possible descendant classes at the time it is authored, or be dynamically updated and recompiled whenever a new class factory is registered. This method on the other hand allows traversing inheritance tree information that may not be available to the schema, and even custom recursive validation by another schema found in said tree.

Many more examples abound, but the important thing is that the draft 4 specification implies custom formats can be applied to any type, unless i misunderstand their meaning. Ideally ajv stays in line with the standard on this point, and/or updates it's documentation to indicate it's existing compliance.
