# [849] An in-range update of bluebird is breaking the build 🚨


## Version **3.5.2** of **bluebird** was just published.

<table>
  <tr>
    <th align=left>
      Branch
    </th>
    <td>
      <a href="https://github.com/epoberezkin/ajv/compare/master...epoberezkin:greenkeeper%2Fbluebird-3.5.2">Build failing 🚨</a>
    </td>
  </tr>
  <tr>
    <th align=left>
      Dependency
    </th>
    <td>
      <a target=_blank href=https://github.com/petkaantonov/bluebird>bluebird</a>
    </td>
  </tr>
  <tr>
    <th align=left>
      Current Version
    </td>
    <td>
      3.5.1
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




bluebird is a devDependency of this project. It **might not break your production code or affect downstream projects**, but probably breaks your build or test tools, which may **prevent deploying or publishing**.



<details>
<summary>Status Details</summary>

- ❌ **continuous-integration/travis-ci/push:** The Travis CI build could not complete due to an error ([Details](https://travis-ci.org/epoberezkin/ajv/builds/423999938?utm_source=github_status&utm_medium=notification)).
- ✅ **coverage/coveralls:** First build on greenkeeper/bluebird-3.5.2 at 99.679% ([Details](https://coveralls.io/builds/18805929)).
</details>


---

<details>
<summary>Release Notes</summary>
<strong>v3.5.2</strong>

<p>Bugfixes:</p>
<ul>
<li>Fix <code>PromiseRejectionEvent</code> to contain <code>.reason</code> and <code>.promise</code> properties. (<a href="/petkaantonov/bluebird/blob/v3.5.2">#1509</a>, <a href="/petkaantonov/bluebird/blob/v3.5.2">#1464</a>)</li>
<li>Fix promise chain retaining memory until the entire chain is resolved  (<a href="/petkaantonov/bluebird/blob/v3.5.2">#1544</a>, <a href="/petkaantonov/bluebird/blob/v3.5.2">#1529</a>)</li>
</ul>
<hr>
<h2>id: changelog<br>
title: Changelog</h2>
</details>

<details>
<summary>Commits</summary>
<p>The new version differs by 22 commits.</p>
<ul>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/50067ec850539f7ba176f9d60069d54fe4819e2b"><code>50067ec</code></a> <code>Release v3.5.2</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/f290da0c1cbc6d2e5542284e9c405dc50ec5e634"><code>f290da0</code></a> <code>Fix memory being retained until promise queue is completely empty (#1544)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/ad6d763a0e575c8ca348610435e6a108e73c505f"><code>ad6d763</code></a> <code>Update benchmarks (#1539)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/49da1ac256c7ee0fb1e07679791399f24648b933"><code>49da1ac</code></a> <code>Fix a typo. (#1534)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/b06106ac7b43ea638cce1eceb4ae76a877247ba1"><code>b06106a</code></a> <code>Fix typo in readme introduced in #1530 (#1531)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/c1dc5b963d106b60a83f5efd3d6a03ea64d2d81e"><code>c1dc5b9</code></a> <code>Update README.md (#1530)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/e35455f446a26e7f5e8513fde1c35a7290acc425"><code>e35455f</code></a> <code>chore: clone last 5 commits (#1521)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/91ae9ce617624d2b549252a101dfab34cfc48407"><code>91ae9ce</code></a> <code>chore: add Node.js 10 (#1523)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/91594726b8f548b354ffc2c072502b20e164f5ea"><code>9159472</code></a> <code>Added a simple usage example (#1369)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/39081ba1dabb7a7b3d407c766d3e9272f8892c6e"><code>39081ba</code></a> <code>Update promise.each.md (#1479)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/77781fe9bdc3c7211af75439d6c0b3cd859902f7"><code>77781fe</code></a> <code>Fix header (#1513)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/b8eedc12758637e23dd865af4cd2dd90d2b6c2d1"><code>b8eedc1</code></a> <code>Update LICENSE to 2018 (#1490)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/4163e825f6df65dc0f483231afa422020e11ec58"><code>4163e82</code></a> <code>Added ES6 way to import the bluebird promise (#1461)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/3790a920e6551dfb6b6a38e70e41157ff6cbaf8e"><code>3790a92</code></a> <code>DOC: add direct link to Promise.delay from API ref (#1465)</code></li>
<li><a href="https://urls.greenkeeper.io/petkaantonov/bluebird/commit/e8d8525a0517280d11d6c77ae6b61df86419232b"><code>e8d8525</code></a> <code>Update error documentation (#1469)</code></li>
</ul>
<p>There are 22 commits in total.</p>
<p>See the <a href="https://urls.greenkeeper.io/petkaantonov/bluebird/compare/dcfa52bf8b8a8fc5cfb0ca24bccb33f7493960ae...50067ec850539f7ba176f9d60069d54fe4819e2b">full diff</a></p>
</details>


<details>
<summary>FAQ and help</summary>

There is a collection of [frequently asked questions](https://greenkeeper.io/faq.html). If those don’t help, you can always [ask the humans behind Greenkeeper](https://github.com/greenkeeperio/greenkeeper/issues/new).
</details>

---


Your [Greenkeeper](https://greenkeeper.io) Bot :palm_tree:
