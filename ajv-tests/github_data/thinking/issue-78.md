# [78] Should not include `ajv-i18n` as a peer dependency

Just a consideration, but `ajv-i18n` is a peer dependency even though it's not used during runtime. This results in warnings for the user, even when we don't want to use it. It's a little confusing. Maybe just link to it, but don't actually list it as a dependency?
