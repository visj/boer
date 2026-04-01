# [156] Serializable validation function

Is there a way to get a serializable validation function that can be used in another context?

For example, CouchDB is a document-based database with a 'validate_doc_update' function which is serialised as a string on a special class of JSON documents called Design Documents. It would be very useful to be able to store the validate function to a string so it could be used to validate documents as they're being updated in the document-database, but currently there are dependencies outside the validation function's context (eg the `equals` function being missing is the current error message I'm getting).

Short of serialising the entire `bundle.js` file in from npm, eval-ing it and generating a validation function inside the inner context, is there a way to generate a serializable validation function?
