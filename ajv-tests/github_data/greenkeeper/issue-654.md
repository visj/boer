# [654] An in-range update of eslint is breaking the build 🚨


## Version **4.14.0** of [eslint](https://github.com/eslint/eslint) was just published.

<table>
  <tr>
    <th align=left>
      Branch
    </th>
    <td>
      <a href="/epoberezkin/ajv/compare/greenkeeper%2Feslint-4.14.0">Build failing 🚨</a>
    </td>
  </tr>
  <tr>
    <th align=left>
      Dependency
    </td>
    <td>
      eslint
    </td>
  </tr>
  <tr>
    <th align=left>
      Current Version
    </td>
    <td>
      4.13.1
    </td>
  </tr>
  <tr>
    <th align=left>
      Type
    </td>
    <td>
      devDependency
    </td>
  </tr>
</table>

This version is **covered** by your **current version range** and after updating it in your project **the build failed**.


eslint is a devDependency of this project. It **might not break your production code or affect downstream projects**, but probably breaks your build or test tools, which may **prevent deploying or publishing**.



<details>
<summary>Status Details</summary>

- ❌ **continuous-integration/travis-ci/push** The Travis CI build failed [Details](https://travis-ci.org/epoberezkin/ajv/builds/320822185?utm_source=github_status&utm_medium=notification)
</details>


---

<details>
<summary>Release Notes</summary>
<strong>v4.14.0</strong>

<ul>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/be2f57e105da5f7c1a87d47bb371f75df83eaca1" class="commit-link"><tt>be2f57e</tt></a> Update: support separate requires in one-var. (fixes <a href="https://urls.greenkeeper.io/eslint/eslint/issues/6175" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="154872636" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/6175">#6175</a>) (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9441" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="265524778" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9441">#9441</a>) (薛定谔的猫)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/370d614a8bdf3c69ce33277cd9faf97ed2c5d414" class="commit-link"><tt>370d614</tt></a> Docs: Fix typos (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9751" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="284017061" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9751">#9751</a>) (Jed Fox)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/8196c45ee02c37b8197a9af542eeab2414300c54" class="commit-link"><tt>8196c45</tt></a> Chore: Reorganize CLI options and associated docs (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9758" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="284217019" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9758">#9758</a>) (Kevin Partington)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/75c741946e4255cdd8e744578bf474b3a7571cec" class="commit-link"><tt>75c7419</tt></a> Update: Logical-and is counted in <code>complexity</code> rule (fixes <a href="https://urls.greenkeeper.io/eslint/eslint/issues/8535" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="225669786" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/8535">#8535</a>) (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9754" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="284074903" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9754">#9754</a>) (Kevin Partington)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/eb4b1e03f82e3e76db65de07b07d2f94d0a8b25e" class="commit-link"><tt>eb4b1e0</tt></a> Docs: reintroduce misspelling in <code>valid-typeof</code> example (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9753" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="284068949" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9753">#9753</a>) (Teddy Katz)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/ae51eb24998299a29c5b87c829587e772f6d9a03" class="commit-link"><tt>ae51eb2</tt></a> New: Add allowImplicit option to array-callback-return (fixes <a href="https://urls.greenkeeper.io/eslint/eslint/issues/8539" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="226039823" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/8539">#8539</a>) (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9344" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="259986168" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9344">#9344</a>) (James C. Davis)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/e9d5dfdc1f6b8593bc3c33df666106a945bf2446" class="commit-link"><tt>e9d5dfd</tt></a> Docs: improve no-extra-parens formatting (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9747" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="283718023" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9747">#9747</a>) (Rich Trott)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/37d066ce9962fbd1723035606d62da96d190be65" class="commit-link"><tt>37d066c</tt></a> Chore: Add unit tests for overrides glob matching. (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9744" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="283661592" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9744">#9744</a>) (Robert Jackson)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/805a94e61fdc81a3fd33d1ce71df61cf33023c56" class="commit-link"><tt>805a94e</tt></a> Chore: Fix typo in CLIEngine test name (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9741" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="283444350" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9741">#9741</a>) (<a href="https://urls.greenkeeper.io/scriptdaemon" class="user-mention">@scriptdaemon</a>)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/1c2aafdc03467ab3a3291b238f561f784b60616e" class="commit-link"><tt>1c2aafd</tt></a> Update: Improve parser integrations (fixes <a href="https://urls.greenkeeper.io/eslint/eslint/issues/8392" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="218795001" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/8392">#8392</a>) (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/8755" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="236662522" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/8755">#8755</a>) (Toru Nagashima)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/4ddc131872420afcdcdfff9fe6d691f86d785f4e" class="commit-link"><tt>4ddc131</tt></a> Upgrade: debug@^3.1.0 (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9731" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="282918508" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9731">#9731</a>) (Kevin Partington)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/f252c1915c16763ca9731e2ac7c67cb16e2100d3" class="commit-link"><tt>f252c19</tt></a> Docs: Make the lint message <code>source</code> property a little more subtle (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9735" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="283038757" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9735">#9735</a>) (Jed Fox)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/5a5c23ce3e18d6ba8e2a5ab0efb4cc21aaadf9cd" class="commit-link"><tt>5a5c23c</tt></a> Docs: fix the link to contributing page (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9727" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="282722182" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9727">#9727</a>) (Victor Hom)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/f44ce115ed40201a2b5ee6d4fbca1b6fdeb137b5" class="commit-link"><tt>f44ce11</tt></a> Docs: change beginner to good first issue label text (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9726" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="282719740" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9726">#9726</a>) (Victor Hom)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/14baa2e2ca47f162a5a08e02706ae365e737d5e7" class="commit-link"><tt>14baa2e</tt></a> Chore: improve arrow-body-style error message (refs <a href="https://urls.greenkeeper.io/eslint/eslint/issues/5498" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="138939742" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/5498">#5498</a>) (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9718" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="281621162" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9718">#9718</a>) (Teddy Katz)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/f819920eea9c1e2288e4a0ebc9ef49321ab0b88a" class="commit-link"><tt>f819920</tt></a> Docs: fix typos (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9723" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="282592631" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9723">#9723</a>) (Thomas Broadley)</li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/43d4ba803ca0e506c8090feacd877ec62eaf78b8" class="commit-link"><tt>43d4ba8</tt></a> Fix: false positive on rule<code>lines-between-class-members</code> (fixes <a href="https://urls.greenkeeper.io/eslint/eslint/issues/9665" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="277738273" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9665">#9665</a>) (<a href="https://urls.greenkeeper.io/eslint/eslint/pull/9680" class="issue-link js-issue-link" data-error-text="Failed to load issue title" data-id="278753377" data-permission-text="Issue title is private" data-url="https://github.com/eslint/eslint/issues/9680">#9680</a>) (sakabar)</li>
</ul>
</details>

<details>
<summary>Commits</summary>
<p>The new version differs by 19 commits.</p>
<ul>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/8d166b4190dbbd1c3796f68a1a5bf3bf71e6837a"><code>8d166b4</code></a> <code>4.14.0</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/5a2961237d73c0c02eb9c9f6328f1597e2664b15"><code>5a29612</code></a> <code>Build: changelog update for 4.14.0</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/be2f57e105da5f7c1a87d47bb371f75df83eaca1"><code>be2f57e</code></a> <code>Update: support separate requires in one-var. (fixes #6175) (#9441)</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/370d614a8bdf3c69ce33277cd9faf97ed2c5d414"><code>370d614</code></a> <code>Docs: Fix typos (#9751)</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/8196c45ee02c37b8197a9af542eeab2414300c54"><code>8196c45</code></a> <code>Chore: Reorganize CLI options and associated docs (#9758)</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/75c741946e4255cdd8e744578bf474b3a7571cec"><code>75c7419</code></a> <code>Update: Logical-and is counted in <code>complexity</code> rule (fixes #8535) (#9754)</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/eb4b1e03f82e3e76db65de07b07d2f94d0a8b25e"><code>eb4b1e0</code></a> <code>Docs: reintroduce misspelling in <code>valid-typeof</code> example (#9753)</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/ae51eb24998299a29c5b87c829587e772f6d9a03"><code>ae51eb2</code></a> <code>New: Add allowImplicit option to array-callback-return (fixes #8539) (#9344)</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/e9d5dfdc1f6b8593bc3c33df666106a945bf2446"><code>e9d5dfd</code></a> <code>Docs: improve no-extra-parens formatting (#9747)</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/37d066ce9962fbd1723035606d62da96d190be65"><code>37d066c</code></a> <code>Chore: Add unit tests for overrides glob matching. (#9744)</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/805a94e61fdc81a3fd33d1ce71df61cf33023c56"><code>805a94e</code></a> <code>Chore: Fix typo in CLIEngine test name (#9741)</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/1c2aafdc03467ab3a3291b238f561f784b60616e"><code>1c2aafd</code></a> <code>Update: Improve parser integrations (fixes #8392) (#8755)</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/4ddc131872420afcdcdfff9fe6d691f86d785f4e"><code>4ddc131</code></a> <code>Upgrade: debug@^3.1.0 (#9731)</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/f252c1915c16763ca9731e2ac7c67cb16e2100d3"><code>f252c19</code></a> <code>Docs: Make the lint message <code>source</code> property a little more subtle (#9735)</code></li>
<li><a href="https://urls.greenkeeper.io/eslint/eslint/commit/5a5c23ce3e18d6ba8e2a5ab0efb4cc21aaadf9cd"><code>5a5c23c</code></a> <code>Docs: fix the link to contributing page (#9727)</code></li>
</ul>
<p>There are 19 commits in total.</p>
<p>See the <a href="https://urls.greenkeeper.io/eslint/eslint/compare/234cd2639c74c783f5ddf58381197aebdcd3bd36...8d166b4190dbbd1c3796f68a1a5bf3bf71e6837a">full diff</a></p>
</details>


<details>
<summary>FAQ and help</summary>

There is a collection of [frequently asked questions](https://greenkeeper.io/faq.html). If those don’t help, you can always [ask the humans behind Greenkeeper](https://github.com/greenkeeperio/greenkeeper/issues/new).
</details>


---


Your [Greenkeeper](https://greenkeeper.io) Bot :palm_tree:
