# [1382] ajv throws error when using ipv4

**What version of Ajv are you using? Does the issue happen if you use the latest version?**

7.0.3

**JSON Schema**

```json
{"oneOf":[{"additionalProperties":false,"properties":{"whitelist":{"items":{"anyOf":[{"format":"ipv4","title":"IPv4","type":"string"},{"pattern":"^([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/([12]?[0-9]|3[0-2])$","title":"IPv4/CIDR","type":"string"},{"format":"ipv6","title":"IPv6","type":"string"},{"pattern":"^([a-fA-F0-9]{0,4}:){1,8}(:[a-fA-F0-9]{0,4}){0,8}([a-fA-F0-9]{0,4})?/[0-9]{1,3}$","title":"IPv6/CIDR","type":"string"}]},"minItems":1,"type":"array"}},"required":["whitelist"],"title":"whitelist"},{"additionalProperties":false,"properties":{"blacklist":{"items":{"anyOf":[{"format":"ipv4","title":"IPv4","type":"string"},{"pattern":"^([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])/([12]?[0-9]|3[0-2])$","title":"IPv4/CIDR","type":"string"},{"format":"ipv6","title":"IPv6","type":"string"},{"pattern":"^([a-fA-F0-9]{0,4}:){1,8}(:[a-fA-F0-9]{0,4}){0,8}([a-fA-F0-9]{0,4})?/[0-9]{1,3}$","title":"IPv6/CIDR","type":"string"}]},"minItems":1,"type":"array"}},"required":["blacklist"],"title":"blacklist"}],"properties":{"disable":{"type":"boolean"}},"type":"object"}
```

**Sample data**


```json
{"whitelist": ["10.255.254.0/24", "192.168.0.0/16"]}
```

**Your code**

Please see https://runkit.com/embed/xmhoyvdnlp2i
**What results did you expect?**

**Are you going to resolve the issue?**