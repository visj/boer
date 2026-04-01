# [1581] error: Maximum call stack size exceeded with schemas having ~510 properties or more

While this was originally posted on https://github.com/ajv-validator/ajv-cli/issues/134 it proved to not be caused by the cli itself, but being more of a generic issue with ajv schema loader.

I recently discovered that bigger generated schemas can easily produce a a error: Maximum call stack size exceeded, even when the checks are quite simple.
```
ajv -- validate --strict=false --errors=json -s f/ansible-playbook.json -d /Users/ssbarnea/c/a/schemas/examples/playbooks/run.yml
schema f/ansible-playbook.json is invalid
error: Maximum call stack size exceeded
```

Based on my initial tests 500 properties worked but 1000 generated this error, which is a very low number. My expectation that that I will likely need 10k in the end. I tested with 510 and job only one schema failing instead of both, with 550 both failed. Clearly the moment it starts to fail is just after 500.

I am not sure what is confusing the loader because in the end the entries are very simple.

Here is one file that has ~1000 entries https://sbarnea.com/ss/ansible-playbook.json and is only ~100kb, just removing some of the properties will make it pass.

I also observed that if I reduce the number of properties to be near the limit, i also get an interesting behavior where it randomly fails with `Maximum call stack size exceeded` on each run. As soon you increase the number bit more it fails all the time.

I tried to use the API directly in order to to some of the options, like `loopRequired` as I was told by @epoberezkin but I was unable to find any configuration option that would prevent this bug from occurring. 