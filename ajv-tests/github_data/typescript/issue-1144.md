# [1144] SemVer regex

I'm trying to build a rule that allow either a proper SemVer version, or a special value such as `latest`.

I couldn't find a regex for SemVer in the documentation. Could it be possible to add an example?

I've tried the following:

```yml
      i18n:
        type: object
        properties:
          version: # "latest" or SemVer regex "v5.0.2"/etc.
            oneOf:
              - enum:
                  - 'latest'
              - type: string # See https://github.com/semver/semver/issues/232
                regexp: ^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(-(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(\.(0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*)?(\+[0-9a-zA-Z-]+(\.[0-9a-zA-Z-]+)*)?$
```

But this regex matches all strings, thus the `lastest` value is rejected because matched by both rules.

I've tested it at https://regex101.com/ with the following values:
```
latest
1.0.0
0.0.1
1.0.0-beta.1
```

And it only matches the 3 proper semver values. But when using it with AJV, it also matches any string such as `latest`, or `johndoe`. I don't know if that's a bug or if regexes work differently when used with AJV?