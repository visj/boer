# [280] Pass base ID as an additional parameter to custom keyword functions

It is needed to support relative $refs in custom keywords, see https://github.com/epoberezkin/ajv-merge-patch/issues/3
The parameter would be added to "compile" and "macro" functions.
