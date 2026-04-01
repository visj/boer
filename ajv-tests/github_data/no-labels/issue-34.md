# [34] Repository structure

A couple of minor (subjective) things that would go a bit to helping out others (like me) get started committing.
- [x] Rename `bin/` to `scripts/`, node modules normally reserve `bin/` for CLIs that the module exposes
- [x] Use `pre-commit` node module and remove `bin/git-hook` - it would do very similar things in the end, except the `pre-commit` module just works automatically (by default it'll run the tests, but you can change that if you only want to compile templates - I usually do both in my test script and I made that change with #33)
- [x] Make aliases for other scripts in `package.json` `"scripts"` - makes script discovery much easier and you can probably remove half the one liners you have in `bin/` right now in favour of `npm run bundle`, `npm run pretest`, etc.
- [x] Super subjective. Look at using something like [standard](https://github.com/feross/standard) for linting
- [x] Make linting run as part of the test suite so PRs match your style
- [x] Add `karma` tests to the `npm test` script - I only just discovered that it's even an option and I've glanced over it a dozen times

I can make a PR with these options enabled/disabled - just let me know which you don't want.
