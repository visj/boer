# [1683] Adding an option to change the regex engine to RE2

**What problem do you want to solve?**
The regex engine of Node.js uses a backtracking algorithm which may result in slow regex validation times for schemas containing unsafe regexes, possibly resulting in ReDoS if the web service waits for the validation to be completed.
**What do you think is the correct solution to problem?**
We can add an option to Ajv to determine the regex engine to use (RE2 or Node.js). RE2 is a regex engine which guarantees worst-case linear time complexity (although it runs slower than a backtracking algorithm for some regexes). It's best if this option would default to Node.js for reasons I will detail below.

The vast majority of regexes behave the same in RE2 as in Node.js (the RE2 test suite works by performing regression testing with a traditional backtracking algorithm and a variety of regex engine flavors). However, there are known, and acknowledged, mismatches between RE2 and Node.js, for example the inclusion of vertical tabs as a whitespace character. There could be other, unknown mismatches as well. It is known that different regex engines may interpret regexes slightly differently, as detailed in [this post](https://davisjam.medium.com/why-arent-regexes-a-lingua-franca-esecfse19-a36348df3a2).

Then, a developer could opt-in to using RE2 if they're sure their regex works correctly in RE2. A try-catch block would try to compile the regex in RE2. If it doesn't - meaning the regex contains extended features such as backreferences, which RE2 cannot support -, we can fallback on the Node.js engine and use self.logger.log to display a brief warning about the fallback.
**Will you be able to implement it?**
Yes.


There are other options for integrating RE2, and I can explain them if this solution isn't found suitable.

Also related:  ajv-validator/ajv-formats#7