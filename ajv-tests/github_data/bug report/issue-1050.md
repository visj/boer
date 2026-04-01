# [1050] any way to skip validation for a property of an object

```
 {
"title": "product",
"type": "object",
"properties": {
    "name": {
        "type": "string",
        "title": "Name",
        "propertyOrder": 1
    },
    "images": {
        "type": "array",
        "title": "acme.form.product.images",
        "items": {
            "type": "string",
            "title": "prototype",
            "format": "data-url"
        },
        "propertyOrder": 3
    }
}
```

I'd like to skip validation of images.items.