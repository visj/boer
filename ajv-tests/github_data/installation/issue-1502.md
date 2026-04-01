# [1502] Cannot use Ajv version 7 in JavaScript

I want to use the Ajv 7 in my project. I already used the previous versions without any problems, but using version 7 leads to an exception: "Uncaught ReferenceError: Ajv is not defined"
Here is my example, how i am calling the Ajv library:
<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8" />
    </head>
    <body>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/ajv/7.2.1/ajv7.min.js"></script>
        <script>
            const ajv = new Ajv();
           const validate = ajv.compile(schema)
          const valid = validate(data)
          if (!valid) console.log(validate.errors)
      </script>
    </body>
</html>