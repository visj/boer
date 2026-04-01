# [893] An in-range update of karma is breaking the build 🚨


## The devDependency [karma](https://github.com/karma-runner/karma) was updated from `3.1.1` to `3.1.2`.

🚨 [View failing branch](https://github.com/epoberezkin/ajv/compare/master...epoberezkin:greenkeeper%2Fkarma-3.1.2).

This version is **covered** by your **current version range** and after updating it in your project **the build failed**.




karma is a devDependency of this project. It **might not break your production code or affect downstream projects**, but probably breaks your build or test tools, which may **prevent deploying or publishing**.



<details>
<summary>Status Details</summary>

- ❌ **continuous-integration/travis-ci/push:** The Travis CI build failed ([Details](https://travis-ci.org/epoberezkin/ajv/builds/462224481?utm_source=github_status&utm_medium=notification)).
- ✅ **coverage/coveralls:** First build on greenkeeper/karma-3.1.2 at 99.68% ([Details](https://coveralls.io/builds/20400062)).
</details>


---

<details>
<summary>Release Notes for v3.1.2</summary>

<h3>Bug Fixes</h3>
<ul>
<li><strong>browser:</strong> report errors to console during singleRun=false (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3209" data-hovercard-type="pull_request" data-hovercard-url="/karma-runner/karma/pull/3209/hovercard">#3209</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/30ff73b">30ff73b</a>), closes <a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3131" data-hovercard-type="issue" data-hovercard-url="/karma-runner/karma/issues/3131/hovercard">#3131</a></li>
<li><strong>changelog:</strong> remove release which does not exist (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3214" data-hovercard-type="pull_request" data-hovercard-url="/karma-runner/karma/pull/3214/hovercard">#3214</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/4e87902">4e87902</a>)</li>
<li><strong>dep:</strong> Bump useragent to fix HeadlessChrome version (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3201" data-hovercard-type="pull_request" data-hovercard-url="/karma-runner/karma/pull/3201/hovercard">#3201</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/240209f">240209f</a>), closes <a href="https://urls.greenkeeper.io/karma-runner/karma/issues/2762" data-hovercard-type="issue" data-hovercard-url="/karma-runner/karma/issues/2762/hovercard">#2762</a></li>
<li><strong>deps:</strong> upgrade sinon-chai 2.x -&gt; 3.x (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3207" data-hovercard-type="pull_request" data-hovercard-url="/karma-runner/karma/pull/3207/hovercard">#3207</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/dc5f5de">dc5f5de</a>)</li>
<li><strong>file-list:</strong> do not preprocess up-to-date files (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3196" data-hovercard-type="pull_request" data-hovercard-url="/karma-runner/karma/pull/3196/hovercard">#3196</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/5334d1a">5334d1a</a>), closes <a href="https://urls.greenkeeper.io/karma-runner/karma/issues/2829" data-hovercard-type="issue" data-hovercard-url="/karma-runner/karma/issues/2829/hovercard">#2829</a></li>
<li><strong>package:</strong> bump lodash version (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3203" data-hovercard-type="pull_request" data-hovercard-url="/karma-runner/karma/pull/3203/hovercard">#3203</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/d38f344">d38f344</a>), closes <a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3177" data-hovercard-type="issue" data-hovercard-url="/karma-runner/karma/issues/3177/hovercard">#3177</a></li>
<li><strong>server:</strong> use flatted for json.stringify (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3220" data-hovercard-type="pull_request" data-hovercard-url="/karma-runner/karma/pull/3220/hovercard">#3220</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/fb05fb1">fb05fb1</a>), closes <a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3215" data-hovercard-type="pull_request" data-hovercard-url="/karma-runner/karma/pull/3215/hovercard">#3215</a></li>
</ul>
<h3>Features</h3>
<ul>
<li><strong>docs:</strong> callout the key debug strategies. (<a href="https://urls.greenkeeper.io/karma-runner/karma/issues/3219" data-hovercard-type="pull_request" data-hovercard-url="/karma-runner/karma/pull/3219/hovercard">#3219</a>) (<a href="https://urls.greenkeeper.io/karma-runner/karma/commit/2682bff">2682bff</a>)</li>
</ul>
</details>

<details>
<summary>Commits</summary>
<p>The new version differs by 11 commits.</p>
<ul>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/7d4d347f53b04f95bf76cbc7dedc2116b2094465"><code>7d4d347</code></a> <code>chore: release v3.1.2</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/5077c18520b801d3e21a400950f35621254e6383"><code>5077c18</code></a> <code>chore: update contributors</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/fb05fb134fb67f8879711054b6e0da0febbbdc7b"><code>fb05fb1</code></a> <code>fix(server): use flatted for json.stringify (#3220)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/2682bff15888cd88cc7e97be2e276cf1cb7f39be"><code>2682bff</code></a> <code>feat(docs): callout the key debug strategies. (#3219)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/4e8790212d3ea712be3184349ff5041d20473baa"><code>4e87902</code></a> <code>fix(changelog): remove release which does not exist (#3214)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/30ff73b35816dad727dd04487f809497f952add5"><code>30ff73b</code></a> <code>fix(browser): report errors to console during singleRun=false (#3209)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/5334d1a86b46f3c106b5a86f0bee7e4a58c5e4ae"><code>5334d1a</code></a> <code>fix(file-list): do not preprocess up-to-date files (#3196)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/dc5f5de537903087afbcfea3d550601f5b380f56"><code>dc5f5de</code></a> <code>fix(deps): upgrade sinon-chai 2.x -&gt; 3.x (#3207)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/d38f344dbca9696d88e0f055b2b4c7dd150708a7"><code>d38f344</code></a> <code>fix(package): bump lodash version (#3203)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/ffb41f93f9f29e1f534514e4f1774123fd249726"><code>ffb41f9</code></a> <code>refactor(browser): log state transitions in debug (#3202)</code></li>
<li><a href="https://urls.greenkeeper.io/karma-runner/karma/commit/240209f738df69a9e382e04d8c59f020b34c3267"><code>240209f</code></a> <code>fix(dep): Bump useragent to fix HeadlessChrome version (#3201)</code></li>
</ul>
<p>See the <a href="https://urls.greenkeeper.io/karma-runner/karma/compare/361aa3f35dcec18c60a8eda24605167bbb91ed79...7d4d347f53b04f95bf76cbc7dedc2116b2094465">full diff</a></p>
</details>


<details>
<summary>FAQ and help</summary>

There is a collection of [frequently asked questions](https://greenkeeper.io/faq.html). If those don’t help, you can always [ask the humans behind Greenkeeper](https://github.com/greenkeeperio/greenkeeper/issues/new).
</details>

---


Your [Greenkeeper](https://greenkeeper.io) Bot :palm_tree:
