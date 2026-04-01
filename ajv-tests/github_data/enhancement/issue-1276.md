# [1276] I met a problem that bothered me a lot，It's about validation

![image](https://user-images.githubusercontent.com/24540969/92429928-018c1e00-f1c6-11ea-8fa3-245fe24ea93c.png)
My info depends on other schema，
I need to rely on info for rendering。
but，If info exists, it will be validated。
Because this is a logic of dynamic processing, info may exist or may not exist depending on the operation of the page。
So, when I don't need the info, I remove the info。
But my page rendering will rely on info, embarrassing。


In short, I hope to skip the verification of info in some way


**" version": "6.12.4" **



