# [766] Feature request: Tag errors as warnings, handle errors criticality levels

We all have to validate data, and sometimes validation fails. But a failure may be treated differently by the software based on the failure criticality. Some validation errors should throw an exception, some should throw a warning, others may be trivial and only throw a log.

My main use case is to make my app work even though the validation schema failed, but only in some cases, so I mainly see "error" and "warning" _(in my current use-case)_, but we could imagine more levels like "log", etc. Basically the same way we handle log levels with "error", "warning", "info", etc. It's kinda the same thing.

What do you think about such feature? Is it already possible? Should we add a new property to fields to define the criticality level? The default should be "error" IMO. (backward compatibility and because it makes more sense)

Then, once the validation is done, we would have "errors" in `errors`, `warnings`, etc. We currently only have `errors`.