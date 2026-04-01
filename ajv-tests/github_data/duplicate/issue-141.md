# [141] Custom coerce types/functions

Would be great to be able to do something like:
`{
    "date": {
        "format": "date", 
        "coerce": function(value){
             return moment(value,'DD/MM/YYYY')
        }
    }
}`

There would be infinite possibilities and usage cases.

Anyway, thanks - great module!
