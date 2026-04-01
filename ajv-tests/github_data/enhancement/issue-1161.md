# [1161] Support for JSON Type Definition

@epoberezkin, you've voiced interest in implementing [JSON Data Definition Format](https://github.com/jddf) ("JDDF"), formerly known as JSL, in AJV. I'm opening this issue to track that discussion.

It seems to me that the first thing to figure out is the answer to the question:

> What would JDDF support for AJV look like?

I think we should figure out the following aspects of the developer experience with using JDDF in AJV, before doing anything else, because they'll define our product requirements:

1. Why would someone choose to use AJV, rather than anything else, for JDDF validation? This should inform everything we do. I think the answer goes back to AJV's core values: excellent performance, excellent conformance, and easy customizability / extensions. But I'd like your take.
1. How do we document support for JDDF in AJV? How do make it so that users aren't confused by whether some feature is JSON Schema-only?
1. How would AJV know whether to use JDDF versus JSON Schema? How does the user indicate which to use?
1. What does writing a custom keyword look like with JDDF?
1. How do we leverage `ajv-i18n` to support JDDF? This is something that can be easier to support with JDDF -- maybe an AJV-independent package can handle this, since error messages are standardized. i18n error messages for custom keywords is trickier, though.
1. How do we leverage `ajv-pack` to support JDDF? Is this going to be hard to do?
1. How are features like filtering additional properties, assigning defaults, async loading and validation going to work? These features are pretty tied to particular JSON Schema features.

I'm not suggesting we need a perfect answer to all these questions. I'm saying that these questions _inform_ our requirements. And maybe the first iteration of AJV's support for JDDF is quite limited. That's fine. But we shouldn't go headfirst into implementation if that prevents us from supporting these more advanced use-cases, or if the developer experience is bad.

Once we get better requirements here, I can convert this ticket into a checklist of things we need.