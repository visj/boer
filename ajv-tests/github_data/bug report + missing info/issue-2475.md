# [2475] Catch Enum Errors value 

Hello , I m using AJV Compiler to validate JSON Data against a defined Schemas , and I m using Literal or Enum to allow only a specific Values :  
```
comparator:
       "strictly-greater" | "strictly-lower"  | "greater-or-equal" |"lower-or-equal" ;
```
However , during validation the compiler doesn't show all allowed values , it only shows : 

```
message: "must be equal to constant"
​​
params: Object { allowedValue: "strictly-greater" }
```
Can anyone assist on that , is it related to my validation logic or the AJV Compiler does catch errros for enum or literal values only for the first value ?! 