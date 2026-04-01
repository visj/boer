# [1781] using data of other properties in async validation

In the documentation of async data validation, we can refer the data of the keyword field by using the data parameter, as follow:

```
const schema = {
  $async: true,
  properties: {
    name: {
      type: "string",
    },
    userId: {
      type: "integer",
      idExists: {table: "users"},
    },
    postId: {
      type: "integer",
      idExists: {table: "posts"},
    },
  },
}

async function checkIdExists(schema, data) {
  const rows = await sql(`SELECT id FROM ${schema.table} WHERE id = ${data}`)
  return !!rows.length // true if record is found
}
```
what if I want to create a validate function which querying the database using the value of name and userId? for example: ```SELECT  id FROM ${schema.table} WHERE id=${data} and name=${data.name}```, I know the data parameter can only be value of postId or userId, but I have a case to reference the value of other field, for example the name field on the above code.
