# [1770] Clone object instead of modifying in-place

Currently, modifications to objects (like `removeAdditional`) are done in-place on the object.

Please provide an option to either:

a) Deep clone the object while validating.
b) Copy-on-write objects that are getting modified.