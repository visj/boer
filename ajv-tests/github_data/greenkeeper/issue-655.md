# [655] An in-range update of uglify-js is breaking the build 🚨


## Version **3.3.0** of [uglify-js](https://github.com/mishoo/UglifyJS2) was just published.

<table>
  <tr>
    <th align=left>
      Branch
    </th>
    <td>
      <a href="/epoberezkin/ajv/compare/greenkeeper%2Fuglify-js-3.3.0">Build failing 🚨</a>
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
      3.2.2
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

- ❌ **continuous-integration/travis-ci/push** The Travis CI build could not complete due to an error [Details](https://travis-ci.org/epoberezkin/ajv/builds/321001431?utm_source=github_status&utm_medium=notification)
</details>


---

<details>
<summary>Release Notes</summary>
<strong>v3.3.0</strong>

<p> </p>
</details>

<details>
<summary>Commits</summary>
<p>The new version differs by 42 commits.</p>
<ul>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/f1556cb9451e9532896f9e553087c9ce83801170"><code>f1556cb</code></a> <code>v3.3.0</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/efffb817357898f3a05d24fdddbf3280e33bf880"><code>efffb81</code></a> <code>fix comments output &amp; improve <code>/*@__PURE__*/</code></code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/202f90ef8f2b282fbd5c063a7e5a34f79551099e"><code>202f90e</code></a> <code>fix corner cases with <code>collapse_vars</code>, <code>inline</code> &amp; <code>reduce_vars</code> (#2637)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/c07ea17c015cb2e0fa3f48927751186ecb421481"><code>c07ea17</code></a> <code>fix escape analysis on <code>AST_PropAccess</code> (#2636)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/edb4e3bd52e1623425927a7d63963ba3b87a3ec2"><code>edb4e3b</code></a> <code>make comments output more robust (#2633)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/4113609dd4d782f0ceb9ec1c3e9c829e05a93aed"><code>4113609</code></a> <code>extend <code>test/ufuzz.js</code> to <code>inline</code> &amp; <code>reduce_funcs</code> (#2620)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/7ac7b0872fd8ba6866162697ac6956a737e20a04"><code>7ac7b08</code></a> <code>remove AST hack from <code>inline</code> (#2627)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/86ae5881b7b269dc656520ff4dddbbd365013a0b"><code>86ae588</code></a> <code>disable <code>hoist_funs</code> by default (#2626)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/fac003c64f5512692e67e41a55b21c74a32a3c6b"><code>fac003c</code></a> <code>avoid <code>inline</code> of function with special argument names (#2625)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/2273655c17b41ab276172afecd652a297c550c00"><code>2273655</code></a> <code>fix <code>inline</code> after single-use <code>reduce_vars</code> (#2623)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/01057cf76d799edc5c7dd45d42a2e7bf44589948"><code>01057cf</code></a> <code>Transform can be simplified when clone is not done. (#2621)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/032f096b7f39d12c303e4d0c096619ad3c9f9384"><code>032f096</code></a> <code>add test for #2613 (#2618)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/4b334edf491bd4c43a72e1a08ad2cf360f240515"><code>4b334ed</code></a> <code>handle global constant collision with local variable after <code>inline</code> (#2617)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/8ddcbc39e617a3ce53a340303fd9ef3226ee0065"><code>8ddcbc3</code></a> <code>compress <code>apply()</code> &amp; <code>call()</code> of <code>function</code> (#2613)</code></li>
<li><a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/commit/0b0eac1d5dc6e1cc1e9bf3682871cafdda59066d"><code>0b0eac1</code></a> <code>drop property assignment to constants (#2612)</code></li>
</ul>
<p>There are 42 commits in total.</p>
<p>See the <a href="https://urls.greenkeeper.io/mishoo/UglifyJS2/compare/24418274084745a224a2715219a4c6029cbfee8f...f1556cb9451e9532896f9e553087c9ce83801170">full diff</a></p>
</details>


<details>
<summary>FAQ and help</summary>

There is a collection of [frequently asked questions](https://greenkeeper.io/faq.html). If those don’t help, you can always [ask the humans behind Greenkeeper](https://github.com/greenkeeperio/greenkeeper/issues/new).
</details>


---


Your [Greenkeeper](https://greenkeeper.io) Bot :palm_tree:
