# [932] An in-range update of jshint is breaking the build 🚨


## The devDependency [jshint](https://github.com/jshint/jshint) was updated from `2.9.7` to `2.10.0`.

🚨 [View failing branch](https://github.com/epoberezkin/ajv/compare/master...epoberezkin:greenkeeper%2Fjshint-2.10.0).

This version is **covered** by your **current version range** and after updating it in your project **the build failed**.




jshint is a devDependency of this project. It **might not break your production code or affect downstream projects**, but probably breaks your build or test tools, which may **prevent deploying or publishing**.



<details>
<summary>Status Details</summary>

- ❌ **continuous-integration/travis-ci/push:** The Travis CI build failed ([Details](https://travis-ci.org/epoberezkin/ajv/builds/488977352?utm_source=github_status&utm_medium=notification)).
</details>


---

<details>
<summary>Release Notes for JSHint 2.10.0</summary>

<h1><a href="https://urls.greenkeeper.io/jshint/jshint/compare/2.9.7...v2.10.0">2.10.0</a> (2019-02-05)</h1>
<p>This release introduces support for the three most recent editions of<br>
JavaScript: ES7, ES8, and ES9. Users can enable support for any one of these<br>
via the <code>esversion</code> linting option.</p>
<p>Perhaps most notably, this includes "async functions." Since their<br>
standardization in ES2017, no feature has been more requested. We're happy to<br>
add support for this powerful new language feature. If the delay is any<br>
indication, extending JSHint's parser was no small task, and we were able to<br>
make many seemingly-unrelated corrections along the way.</p>
<p>That progress is easiest to see in JSHint's performance on Test262 (the<br>
official test suite for the JavaScript programming language). Version 2.9.6<br>
passed 84% of those tests. Version 2.10.0 passes 96%. We're excited to push<br>
that number higher, especially considering that new language features and new<br>
tests are being added every day. If you're curious about what needs to be done,<br>
we maintain an "expectations file" describing every test JSHint is known to<br>
fail today.</p>
<p>This release also includes brand-new parsing logic for classes. We thank Ethan<br>
Dorta and Alex Kritchevsky, the two first-time contributors who made this<br>
possible!</p>
<h3>Bug Fixes</h3>
<ul>
<li>Accept new RegExp flag introduced by ES6 (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/26b9e53">26b9e53</a>)</li>
<li>Add global variables introduced in ES2017 (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/aded551">aded551</a>)</li>
<li>Add globals for EventTarget interface (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/b78083a">b78083a</a>)</li>
<li>Add globals for WindowOrWorkerGlobalScope (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/e0aac94">e0aac94</a>)</li>
<li>Allow YieldExpression as computed property (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/40dca82">40dca82</a>)</li>
<li>Correct implementation of spread/rest (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/bd0ae0d">bd0ae0d</a>)</li>
<li>Correct invalid function invocation (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/cda02ae">cda02ae</a>)</li>
<li>Correct parsing of <code>let</code> token (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/030d6b4">030d6b4</a>)</li>
<li>Correct parsing of arrow function (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/8fa6e39">8fa6e39</a>)</li>
<li>Correct parsing of InExpression (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/06f54d0">06f54d0</a>)</li>
<li>Disallow dups in non-simple parameter list (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/4a5a4a5">4a5a4a5</a>)</li>
<li>Disallow fn declarations in stmt positions (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/a0e0305">a0e0305</a>)</li>
<li>Disallow YieldExpression in gnrtr params (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/17ca4e4">17ca4e4</a>)</li>
<li>Enforce UniqueFormalParameters for methods (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/280d36b">280d36b</a>)</li>
<li>Honor <code>globals</code> config in JavaScript API (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/0278731">0278731</a>)</li>
<li>Report invalid syntax as error (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/5ca8b1a">5ca8b1a</a>)</li>
<li>Update parsing of object "rest" property (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/58967ea">58967ea</a>)</li>
</ul>
<h3>Features</h3>
<ul>
<li>Enable object rest/spread via esversion (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/3fc9c19">3fc9c19</a>)</li>
<li>Enforce ES2016 restriction on USD (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/2c2025b">2c2025b</a>)</li>
<li>Implement <code>noreturnawait</code> (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/70ab03d">70ab03d</a>)</li>
<li>Implement <code>regexpu</code> option (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/962dced">962dced</a>)</li>
<li>Implement ES2019 RegExp "dotall" (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/457d732">457d732</a>)</li>
<li>Implement support for async iteration (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/1af5930">1af5930</a>)</li>
<li>Implement support for ES8 trailing commas (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/29cab1f">29cab1f</a>)</li>
<li>Implement support for object spread/rest (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/35e1b17">35e1b17</a>)</li>
<li>Introduce exponentiation operator (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/21b8731">21b8731</a>)</li>
<li>Introduce linting option <code>leanswitch</code> (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/1f008f2">1f008f2</a>)</li>
<li>Introduce support for async functions (<a href="https://urls.greenkeeper.io/jshint/jshint/commit/bc4ae9f">bc4ae9f</a>)</li>
</ul>
</details>

<details>
<summary>Commits</summary>
<p>The new version differs by 51 commits.</p>
<ul>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/b7faa24675c38ce27cf783bc7f8841cf143d1641"><code>b7faa24</code></a> <code>v2.10.0</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/64179783ba36e2ae2de8ebdbbbad58b4ec1ca8c7"><code>6417978</code></a> <code>Merge branch 'v2.10.0'</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/f80e049c62d611afa9b72dc901609941a7d2ace0"><code>f80e049</code></a> <code>[[CHORE]] Reorder parameters of internal function</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/90904ce67a940ac4e42218786e0638047c4843ae"><code>90904ce</code></a> <code>[[DOCS]] Document new <code>esversion</code> values</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/aded551e773c86aa16b229e38b53746315ae8890"><code>aded551</code></a> <code>[[FIX]] Add global variables introduced in ES2017</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/457d7323eb1d7e099e65825278bd1c217c39975f"><code>457d732</code></a> <code>[[FEAT]] Implement ES2019 RegExp "dotall"</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/962dced398f3629961bf17fd80faa0256a7b292a"><code>962dced</code></a> <code>[[FEAT]] Implement <code>regexpu</code> option</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/1af5930e9e8a83e064e81bd1f77d5b4ac6d33617"><code>1af5930</code></a> <code>[[FEAT]] Implement support for async iteration</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/70ab03dbd3be9017407208c7f104f013458b2fbf"><code>70ab03d</code></a> <code>[[FEAT]] Implement <code>noreturnawait</code></code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/bc4ae9fd32992d94e5ff79757d586f8b19ddf130"><code>bc4ae9f</code></a> <code>[[FEAT]] Introduce support for async functions</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/e0aac9498fb90de91e0b89efb929e55eb94827ee"><code>e0aac94</code></a> <code>[[FIX]] Add globals for WindowOrWorkerGlobalScope</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/b78083a6dd72e81b698352300583f1cac2f5a2dc"><code>b78083a</code></a> <code>[[FIX]] Add globals for EventTarget interface</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/40dca824ff4cb327199975e153690c6af3b1d2e1"><code>40dca82</code></a> <code>[[FIX]] Allow YieldExpression as computed property</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/17ca4e43b37c7bfc06618dacc8deb4db6fefaaa0"><code>17ca4e4</code></a> <code>[[FIX]] Disallow YieldExpression in gnrtr params</code></li>
<li><a href="https://urls.greenkeeper.io/jshint/jshint/commit/3fc9c1907ac634b7e156c3ece87c81639beabcda"><code>3fc9c19</code></a> <code>[[FEAT]] Enable object rest/spread via esversion</code></li>
</ul>
<p>There are 51 commits in total.</p>
<p>See the <a href="https://urls.greenkeeper.io/jshint/jshint/compare/01bf8c67bfc81c4c0c89122f5f33a2f77bff7722...b7faa24675c38ce27cf783bc7f8841cf143d1641">full diff</a></p>
</details>


<details>
<summary>FAQ and help</summary>

There is a collection of [frequently asked questions](https://greenkeeper.io/faq.html). If those don’t help, you can always [ask the humans behind Greenkeeper](https://github.com/greenkeeperio/greenkeeper/issues/new).
</details>

---


Your [Greenkeeper](https://greenkeeper.io) Bot :palm_tree:
