# [661] required fields

Hi,
We are using AJV to yield error messages from our user filled forms in conjunction with JSON Schema that we receive from our servers, it is working great.

One thing we weren't able to solve:
Is there a way to get all the required fields (even if filled)?

we need to mark them with * as "required" but we can't rely on the required error as it disappears after a value has the data has been filled, also the required fields might change depending on the schema and data combinations.