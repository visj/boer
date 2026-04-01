# [1306] Remove data that fail validation

We have a set of schemas for our own data and we can use them for third-party data too. However these don't need to be fully compliant, we can take what's valid and remove what failed

Obviously we can't end up with data that is invalid as a result. For example we can't remove something that has failed but is required.

I think that from past similar discussions, there's a preference for having this as a plugin as opposed to a core feature. Is this still the case and what are your thoughts on this?
