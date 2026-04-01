# [2564] Consider adopting npm trusted publishing

Recent [supply chain attacks on npm](https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/) have highlighted the need for stronger package publishing security. The September 2025 Shai-Hulud worm compromised 500+ packages through stolen maintainer tokens, showing the risks of token-based publishing.

Trusted publishing helps by eliminating long-lived tokens that can be stolen or accidentally exposed; generating automatic provenance provides cryptographic proof of where/how packages are built; and is an industry standard adopted by PyPI, RubyGems, crates.io, NuGet, etc.

Here's the short version:

1. [Configure a trusted publisher on npmjs.com](https://docs.npmjs.com/trusted-publishers#github-actions-configuration)
1. Add `id-token: write` permission to your workflow
1. Remove `NODE_AUTH_TOKEN` from your workflow

npm is [planning to deprecate legacy tokens](https://github.blog/security/supply-chain-security/our-plan-for-a-more-secure-npm-supply-chain/#h-npm-s-roadmap-for-hardening-package-publication) and make trusted publishing the preferred method.

Would you consider adopting trusted publishing to help secure the npm ecosystem?

References:

- [npm trusted publishing documentation](https://docs.npmjs.com/trusted-publishers)
- [Announcement blog post](https://github.blog/changelog/2025-07-31-npm-trusted-publishing-with-oidc-is-generally-available/)
- [Provenance statements guide](https://docs.npmjs.com/generating-provenance-statements)