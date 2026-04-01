# [2553] Add schema in the middle of validation



**What version of Ajv you are you using?**

Latest

**What problem do you want to solve?**

I want to addSchema on the fly when a ProtoDeclare property key and associated property object value is found, which is like an extension to allow for property keys with associated validateable object to be validated later on in the document.

Note that ProtoDeclare object should be processed to determine correct schema to build.

**What do you think is the correct solution to problem?**

Add a hook to allow additional schema to be added when a property key is found, which affects keyed objects later in the document.

**Will you be able to implement it?**

Not soon


The alternative is to convert to DOM (something serverside).