# [874] [FAQ] Reword the concurrency mention

(I felt free to disregard the template, as this issue is about the FAQ and not the library itself)

The Frequently Asked Questions states the following about the safety of the errors property on the validation functions:

> **Would errors get overwritten in case of “concurrent” validations?**
No. There is no concurrency in JavaScript - it is single-threaded. While a validation is run no other JavaScript code (that can access the same memory) can be executed. As long as the errors are used in the same execution block, the errors will not be overwritten.

While the reasoning is sound, the terminology here is incorrect. Javascript is, in fact, highly concurrent, but it's not parallel. Also, this guarantee only applies because the concurrency model of javascript is cooperative and not preemptive.

I suggest rewording this segment to use the proper terminology, that is, that the cooperative concurrency model of javascript makes this pattern safe.
