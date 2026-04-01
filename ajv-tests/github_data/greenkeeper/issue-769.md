# [769] Version 10 of node.js has been released


## Version 10 of Node.js (code name Dubnium) has been released! 🎊

To see what happens to your code in Node.js 10, Greenkeeper has created a branch with the following changes:
- Added the new Node.js version to your `.travis.yml`

If you’re interested in upgrading this repo to Node.js 10, you can <a href="/epoberezkin/ajv/compare/master...epoberezkin:greenkeeper%2Fupdate-to-node-10">open a PR with these changes</a>. Please note that this issue is just intended as a friendly reminder and the PR as a possible starting point for getting your code running on Node.js 10.

<details>
<summary>More information on this issue</summary>

Greenkeeper has checked the `engines` key in any `package.json` file, the `.nvmrc` file, and the `.travis.yml` file, if present.
- `engines` was only updated if it defined a single version, not a range.
- `.nvmrc` was updated to Node.js 10
- `.travis.yml` was only changed if there was a root-level `node_js` that didn’t already include Node.js 10, such as `node` or `lts/*`. In this case, the new version was appended to the list. We didn’t touch job or matrix configurations because these tend to be quite specific and complex, and it’s difficult to infer what the intentions were.

For many simpler `.travis.yml` configurations, this PR should suffice as-is, but depending on what you’re doing it may require additional work or may not be applicable at all. We’re also aware that you may have good reasons to not update to Node.js 10, which is why this was sent as an issue and not a pull request. Feel free to delete it without comment, I’m a humble robot and won’t feel rejected :robot:

</details>

---

<details>
<summary>FAQ and help</summary>

There is a collection of [frequently asked questions](https://greenkeeper.io/faq.html). If those don’t help, you can always [ask the humans behind Greenkeeper](https://github.com/greenkeeperio/greenkeeper/issues/new).
</details>

---


Your [Greenkeeper](https://greenkeeper.io) Bot :palm_tree:
