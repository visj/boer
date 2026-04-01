# [244] Using with "numeric" type

Hello. I need to validate data of type "numeric" a.k.a. decimal or string of digits (see numeric type in postgresql). In schema v5 there is `formatMinimum` and `formatMaximum`, but it does not support "numeric" type. Using `parseFloat` in js is not an option, because you know the result of 0.1+0.2. Any suggestions?
