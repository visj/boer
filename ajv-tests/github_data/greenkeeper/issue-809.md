# [809] An in-range update of karma is breaking the build 🚨


## Version **2.0.4** of **[karma](https://github.com/karma-runner/karma)** was just published.

<table>
  <tr>
    <th align=left>
      Branch
    </th>
    <td>
      <a href="https://github.com/epoberezkin/ajv/compare/master...epoberezkin:greenkeeper%2Fkarma-2.0.4">Build failing 🚨</a>
    </td>
  </tr>
  <tr>
    <th align=left>
      Dependency
    </th>
    <td>
      <code>[karma](https://github.com/karma-runner/karma)</code>
    </td>
  </tr>
  <tr>
    <th align=left>
      Current Version
    </td>
    <td>
      2.0.3
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




karma is a devDependency of this project. It **might not break your production code or affect downstream projects**, but probably breaks your build or test tools, which may **prevent deploying or publishing**.



<details>
<summary>Status Details</summary>

- ❌ **continuous-integration/travis-ci/push** The Travis CI build could not complete due to an error [Details](https://travis-ci.org/epoberezkin/ajv/builds/395136478?utm_source=github_status&utm_medium=notification)
- ✅ **coverage/coveralls** First build on greenkeeper/karma-2.0.4 at 99.679% [Details](https://coveralls.io/builds/17619649)
</details>


---

<details>
<summary>Release Notes</summary>
<strong>v2.0.4</strong>

<h3>Bug Fixes</h3>
<ul>
<li><strong>deps:</strong> remove babel-core and babel call in wallaby. (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3044">#3044</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/7da8ca0">7da8ca0</a>)</li>
<li><strong>events:</strong> bind emitters with for..in. (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3059">#3059</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/b99f03f">b99f03f</a>), closes <a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3057">#3057</a></li>
<li><strong>launcher:</strong> Only markCaptured browsers that are launched. (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3047">#3047</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/f8f3ebc">f8f3ebc</a>)</li>
<li><strong>server:</strong> actually call stert(). (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3062">#3062</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/40d836a">40d836a</a>)</li>
<li><strong>server:</strong> Resurrect static function Server.start() lost in 2.0.3 (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3055">#3055</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/c88ebc6">c88ebc6</a>)</li>
</ul>
</details>

<details>
<summary>Commits</summary>
<p>The new version differs by 9 commits.</p>
<ul>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/dee3615dd5269da7e3ce0a64952e6062ae117897"><code>dee3615</code></a> <code>chore: release v2.0.4</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/f61c936ee692cdc8ea7d42c880e07bb245580be1"><code>f61c936</code></a> <code>chore: update contributors</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/40d836a93aa18f310bad425664654d685730ba0f"><code>40d836a</code></a> <code>fix(server): actually call stert(). (#3062)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/414b84c59fd1f2f57bae4f77f1c0b4425a41dfc9"><code>414b84c</code></a> <code>refactor(file-list): clean lib/file-list.js</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/7da8ca058b3868669e4e57ae614c1bea4de9e2fd"><code>7da8ca0</code></a> <code>fix(deps): remove babel-core and babel call in wallaby. (#3044)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/c88ebc6eeba7712803897e94616b04e6c1f2089b"><code>c88ebc6</code></a> <code>fix(server): Resurrect static function Server.start() lost in 2.0.3 (#3055)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/b99f03fcb8242dd2fd1ac769642c41314679833b"><code>b99f03f</code></a> <code>fix(events): bind emitters with for..in. (#3059)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/ab3c0e3aec08e9aa0d2b4071830a3e00ed4e2331"><code>ab3c0e3</code></a> <code>refactor(temp-dir): update lib/temp_dir.js to ES6 (#3049)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/f8f3ebc45751ffba6ec1aa1d1554c7dfe91de85b"><code>f8f3ebc</code></a> <code>fix(launcher): Only markCaptured browsers that are launched. (#3047)</code></li>
</ul>
<p>See the <a href="https://urls.greenkeeper.io/karma-runner/karma/compare/333e7d4060865f32372bf4a3365a6e47a6aeefa1...dee3615dd5269da7e3ce0a64952e6062ae117897">full diff</a></p>
</details>


<details>
<summary>FAQ and help</summary>

There is a collection of [frequently asked questions](https://greenkeeper.io/faq.html). If those don’t help, you can always [ask the humans behind Greenkeeper](https://github.com/greenkeeperio/greenkeeper/issues/new).
</details>

---


Your [Greenkeeper](https://greenkeeper.io) Bot :palm_tree:
