# [1313] removeAdditional option : Log property removals. 

**What version of Ajv you are you using?**  v6.12.6

**What problem do you want to solve?** When using the **removeAdditional** option it would be great to know which properties were actually removed or if any was removed at all. 

**What do you think is the correct solution to problem?** Similar to the ajv errors array, it would be great to have a "mutations" array that would have a format similar to this : 

`[{property: ".a.x", event: "removed"}, {property: ".a.y", event: "removed"}]`

We could have this mutations log for every mutating parameters such as useDefaults and coerceTypes.

**Will you be able to implement it?** I would love to implement it by myself if the idea is welcomed by the core team and if I could get minimal guidance into the inner workings of ajv, in particular the removeadditionnal feature made by @andyscott . 
