# [699] An in-range update of uglify-js is breaking the build 🚨


## Version **3.3.10** of [uglify-js](https://github.com/mishoo/UglifyJS2) was just published.

<table>
  <tr>
    <th align=left>
      Branch
    </th>
    <td>
      <a href="/epoberezkin/ajv/compare/greenkeeper%2Fuglify-js-3.3.10">Build failing 🚨</a>
    </td>
  </tr>
  <tr>
    <th align=left>
      Dependency
    </td>
    <td>
      uglify-js
    </td>
  </tr>
  <tr>
    <th align=left>
      Current Version
    </td>
    <td>
      3.3.9
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


uglify-js is a devDependency of this project. It **might not break your production code or affect downstream projects**, but probably breaks your build or test tools, which may **prevent deploying or publishing**.



<details>
<summary>Status Details</summary>

- ❌ **coverage/coveralls** Coverage pending from Coveralls.io [Details](https://coveralls.io/builds/15433734)
- ❌ **continuous-integration/travis-ci/push** The Travis CI build failed [Details](https://travis-ci.org/epoberezkin/ajv/builds/338993328?utm_source=github_status&utm_medium=notification)
</details>


---

<details>
<summary>Commits</summary>
<p>The new version differs by 24 commits.</p>
<ul>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/0cfbd79aa123a97c94c1bf5032acf11c15886dad"><code>0cfbd79</code></a> <code>v3.3.10</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/d66d86f20bc231bd8d305ee5ba05efa77aa8b6be"><code>d66d86f</code></a> <code>account for exceptions in <code>AST_Assign.left</code> (#2892)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/905325d3e21a5dc3d3f5835f609f30055c25bf2b"><code>905325d</code></a> <code>update dependencies (#2889)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/dea0cc06624898883c30a0d147b3146027ddc72e"><code>dea0cc0</code></a> <code>mention file encoding (#2887)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/d69d8007d6f9d3ee5a202b089ed6319cb33e69f9"><code>d69d800</code></a> <code>evaluate <code>to{Low,Upp}erCase()</code> under <code>unsafe</code> (#2886)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/c0b8f2a16d4804fe302e5db91995735ee7041c8d"><code>c0b8f2a</code></a> <code>add information on testing and code style (#2885)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/cb0257dbbfa9c71c20b2bb3a91b7bfdad7a1459e"><code>cb0257d</code></a> <code>describe a few compiler assumptions (#2883)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/9637f51b6865d0987dcd950bc7113c871ca6cb3c"><code>9637f51</code></a> <code>change <code>undefined == x</code> to <code>null == x</code> (#2882)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/3026bd89759446c9c5d6fa1cd69651f853ffe08d"><code>3026bd8</code></a> <code>improve exceptional flow compression by <code>collapse_vars</code> (#2880)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/78a44d5ab0fd2195c8f22cc8a39193b33dad6188"><code>78a44d5</code></a> <code>maintain order between side-effects and externally observable assignments (#2879)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/7e13c0db4034d2c28e36473a3add915de1813844"><code>7e13c0d</code></a> <code>handle <code>break</code> &amp; <code>continue</code> in <code>collapse_vars</code> (#2875)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/e6a2e9e4d08b73c327e95bcd4da923f9404788d0"><code>e6a2e9e</code></a> <code>allow <code>collapse_vars</code> across conditional branches (#2867)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/e773f0392769794173358b362a645facb51b2ad2"><code>e773f03</code></a> <code>fix assignment logic in <code>reduce_vars</code> (#2872)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/b16380d66961f408932de781a3425d2992ec51b3"><code>b16380d</code></a> <code>fix missing corner case in #2855 (#2868)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/334b07a3dba84ceadbc88c068667caf144f46efb"><code>334b07a</code></a> <code>Update License Copyright Year to 2018 (#2866)</code></li>
</ul>
<p>There are 24 commits in total.</p>
<p>See the <a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/compare/4eb4cb656cc4f3850c403689cf29e529f4c67944...0cfbd79aa123a97c94c1bf5032acf11c15886dad">full diff</a></p>
</details>


<details>
<summary>FAQ and help</summary>

There is a collection of [frequently asked questions](https://greenkeeper.io/faq.html). If those don’t help, you can always [ask the humans behind Greenkeeper](https://github.com/greenkeeperio/greenkeeper/issues/new).
</details>


---


Your [Greenkeeper](https://greenkeeper.io) Bot :palm_tree:
