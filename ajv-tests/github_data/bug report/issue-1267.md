# [1267] CVE-2020-15366

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

The security issue is for (at least) 6.12.2.

**What results did you expect?**

We upgraded our security tooling to whitesource, which now detects https://nvd.nist.gov/vuln/detail/CVE-2020-15366 against ajv 6.12.2 (prototype pollution).  Note that npm-audit did not pick up this issue.  I had a look through your recent change logs, and could not find any changes related to it.  I did not find any issues with this CVE, so you may not even be aware it existed.

**Are you going to resolve the issue?**

No.