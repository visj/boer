# [2557] Memory leak introduced by recent update

We recently updated our code to use v8.17.1 from v6.12.6 and found it has introduced a memory leak related to the validate() function. We separately use compile() elsewhere which appears to be unaffected.

It was quite serious as it nearly brought our service down.



