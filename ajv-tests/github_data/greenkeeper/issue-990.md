# [990] An in-range update of mocha is breaking the build 🚨


## The devDependency [mocha](https://github.com/mochajs/mocha) was updated from `6.0.2` to `6.1.0`.

🚨 [View failing branch](https://github.com/epoberezkin/ajv/compare/master...epoberezkin:greenkeeper%2Fmocha-6.1.0).

This version is **covered** by your **current version range** and after updating it in your project **the build failed**.




mocha is a devDependency of this project. It **might not break your production code or affect downstream projects**, but probably breaks your build or test tools, which may **prevent deploying or publishing**.



<details>
<summary>Status Details</summary>

- ❌ **continuous-integration/travis-ci/push:** The Travis CI build failed ([Details](https://travis-ci.org/epoberezkin/ajv/builds/516889322?utm_source=github_status&utm_medium=notification)).
- ✅ **coverage/coveralls:** First build on greenkeeper/mocha-6.1.0 at 99.62% ([Details](https://coveralls.io/builds/22651681)).
</details>


---

<details>
<summary>Release Notes for v6.1.0</summary>

<h1>6.1.0 / 2019-04-07</h1>
<h2><g-emoji class="g-emoji" alias="lock" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f512.png">🔒</g-emoji> Security Fixes</h2>
<ul>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3845" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3845/hovercard">#3845</a>: Update dependency "js-yaml" to v3.13.0 per npm security advisory (<a href="https://urls.greenkeeper.io/plroebuck"><strong>@plroebuck</strong></a>)</li>
</ul>
<h2><g-emoji class="g-emoji" alias="tada" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f389.png">🎉</g-emoji> Enhancements</h2>
<ul>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3766" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3766/hovercard">#3766</a>: Make reporter constructor support optional <code>options</code> parameter (<a href="https://urls.greenkeeper.io/plroebuck"><strong>@plroebuck</strong></a>)</li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3760" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3760/hovercard">#3760</a>: Add support for config files with <code>.jsonc</code> extension (<a href="https://urls.greenkeeper.io/sstephant"><strong>@sstephant</strong></a>)</li>
</ul>
<h2><g-emoji class="g-emoji" alias="fax" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f4e0.png">📠</g-emoji> Deprecations</h2>
<p>These are <em>soft</em>-deprecated, and will emit a warning upon use. Support will be removed in (likely) the next major version of Mocha:</p>
<ul>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3719" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3719/hovercard">#3719</a>: Deprecate <code>this.skip()</code> for "after all" hooks (<a href="https://urls.greenkeeper.io/juergba"><strong>@juergba</strong></a>)</li>
</ul>
<h2><g-emoji class="g-emoji" alias="bug" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f41b.png">🐛</g-emoji> Fixes</h2>
<ul>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3829" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3829/hovercard">#3829</a>: Use cwd-relative pathname to load config file (<a href="https://urls.greenkeeper.io/plroebuck"><strong>@plroebuck</strong></a>)</li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3745" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3745/hovercard">#3745</a>: Fix async calls of <code>this.skip()</code> in "before each" hooks (<a href="https://urls.greenkeeper.io/juergba"><strong>@juergba</strong></a>)</li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3669" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3669/hovercard">#3669</a>: Enable <code>--allow-uncaught</code> for uncaught exceptions thrown inside hooks (<a href="https://urls.greenkeeper.io/givanse"><strong>@givanse</strong></a>)</li>
</ul>
<p>and some regressions:</p>
<ul>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3848" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3848/hovercard">#3848</a>: Fix <code>Suite</code> cloning by copying <code>root</code> property (<a href="https://urls.greenkeeper.io/fatso83"><strong>@fatso83</strong></a>)</li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3816" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3816/hovercard">#3816</a>: Guard against undefined timeout option (<a href="https://urls.greenkeeper.io/boneskull"><strong>@boneskull</strong></a>)</li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3814" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3814/hovercard">#3814</a>: Update "yargs" in order to avoid deprecation message (<a href="https://urls.greenkeeper.io/boneskull"><strong>@boneskull</strong></a>)</li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3788" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3788/hovercard">#3788</a>: Fix support for multiple node flags (<a href="https://urls.greenkeeper.io/aginzberg"><strong>@aginzberg</strong></a>)</li>
</ul>
<h2><g-emoji class="g-emoji" alias="book" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f4d6.png">📖</g-emoji> Documentation</h2>
<ul>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha-examples">mochajs/mocha-examples</a>: New repository of working examples of common configurations using mocha (<a href="https://urls.greenkeeper.io/craigtaub"><strong>@craigtaub</strong></a>)</li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3850" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3850/hovercard">#3850</a>: Remove pound icon showing on header hover on docs (<a href="https://urls.greenkeeper.io/jd2rogers2"><strong>@jd2rogers2</strong></a>)</li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3812" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3812/hovercard">#3812</a>: Add autoprefixer to documentation page CSS (<a href="https://urls.greenkeeper.io/Munter"><strong>@Munter</strong></a>)</li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3811" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3811/hovercard">#3811</a>: Update doc examples "tests.html" (<a href="https://urls.greenkeeper.io/DavidLi119"><strong>@DavidLi119</strong></a>)</li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3807" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3807/hovercard">#3807</a>: Mocha website HTML tweaks (<a href="https://urls.greenkeeper.io/plroebuck"><strong>@plroebuck</strong></a>)</li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3793" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3793/hovercard">#3793</a>: Update config file example ".mocharc.yml" (<a href="https://urls.greenkeeper.io/cspotcode"><strong>@cspotcode</strong></a>)</li>
</ul>
<h2><g-emoji class="g-emoji" alias="nut_and_bolt" fallback-src="https://github.githubassets.com/images/icons/emoji/unicode/1f529.png">🔩</g-emoji> Other</h2>
<ul>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3830" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3830/hovercard">#3830</a>: Replace dependency "findup-sync" with "find-up" for faster startup (<a href="https://urls.greenkeeper.io/cspotcode"><strong>@cspotcode</strong></a>)</li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/issues/3799" data-hovercard-type="pull_request" data-hovercard-url="/mochajs/mocha/pull/3799/hovercard">#3799</a>: Update devDependencies to fix many npm vulnerabilities (<a href="https://urls.greenkeeper.io/XhmikosR"><strong>@XhmikosR</strong></a>)</li>
</ul>
</details>

<details>
<summary>Commits</summary>
<p>The new version differs by 28 commits.</p>
<ul>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/f4fc95a94ec6f2348000465be8f15ac2436260d5"><code>f4fc95a</code></a> <code>Release v6.1.0</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/bd29dbd787145b2e4140da7b6a0a9b24fc9b3eab"><code>bd29dbd</code></a> <code>update CHANGELOG for v6.1.0 [ci skip]</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/aaf2b7249a1675fee105c37d1e679145bee7f50c"><code>aaf2b72</code></a> <code>Use cwd-relative pathname to load config file (#3829)</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/b079d24161ead240b5f7ec8dbfbe7449d0380b3b"><code>b079d24</code></a> <code>upgrade deps as per npm audit fix; closes #3854</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/e87c689f9c007b7a9a05b246fa271382b8577d39"><code>e87c689</code></a> <code>Deprecate this.skip() for "after all" hooks (#3719)</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/81cfa9072b79fee57ba8fe1b9ddf8d774aa41f2e"><code>81cfa90</code></a> <code>Copy Suite property "root" when cloning; closes #3847 (#3848)</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/8aa2fc4ceb765b59e2306ae545204dec3b40eb5c"><code>8aa2fc4</code></a> <code>Fix issue 3714, hide pound icon showing on hover header on docs page (#3850)</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/586bf78499b23e5f514b534cf93cf31e53fd0a42"><code>586bf78</code></a> <code>Update JS-YAML to address security issue (#3845)</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/d1024a3ea8298dda76afee2196b5f94472538cff"><code>d1024a3</code></a> <code>Update doc examples "tests.html" (#3811)</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/1d570e0bfa02c1c35e58872e8dc736a9be36e0bc"><code>1d570e0</code></a> <code>Delete "/docs/example/chai.js"</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/ade8b90a46c641345b67c7979f855bcfbda900d5"><code>ade8b90</code></a> <code>runner.js: "self.test" undefined in Browser (#3835)</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/009814704df229b7c38edd0b8c503e701e9bb323"><code>0098147</code></a> <code>Replace findup-sync with find-up for faster startup (#3830)</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/d5ba1214574f68211eb663c8a0b1aab6d79a0148"><code>d5ba121</code></a> <code>Remove "package" flag from sample config file because it can only be passes as CLI arg (#3793)</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/a3089ad7215306bc7fb6db5043f404d6cfbb20bf"><code>a3089ad</code></a> <code>update package-lock</code></li>
<li><a href="https://urls.greenkeeper.io/mochajs/mocha/commit/75430ec1b2e9c688503c0aaf198a908eff5b682a"><code>75430ec</code></a> <code>Upgrade yargs-parser dependency to avoid loading 2 copies of yargs</code></li>
</ul>
<p>There are 28 commits in total.</p>
<p>See the <a href="https://urls.greenkeeper.io/mochajs/mocha/compare/00a895f6ad9c1e4c5500851d6ff875e8254a5e06...f4fc95a94ec6f2348000465be8f15ac2436260d5">full diff</a></p>
</details>


<details>
<summary>FAQ and help</summary>

There is a collection of [frequently asked questions](https://greenkeeper.io/faq.html). If those don’t help, you can always [ask the humans behind Greenkeeper](https://github.com/greenkeeperio/greenkeeper/issues/new).
</details>

---


Your [Greenkeeper](https://greenkeeper.io) Bot :palm_tree:
