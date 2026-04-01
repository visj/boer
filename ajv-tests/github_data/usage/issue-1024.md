# [1024] Array/enum of allowed strings/values

How i can make it?
for example:
type array
allowedStrings:['abcd','efgh','123','check','it','out'].
minElements: 1
Data:
['abcd','123'] -> valid
['abcd','kekc'] -> invalid
['abcd',123] -> invalid
[] -> invalid