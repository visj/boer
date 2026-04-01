# [750] Missing logger in Typescript declarations

Tested in 6.4.0. I think there should be a:

```ts
{log: (msg: string) => void; warn: (msg: string) => void; error: (msg: string) => void}
```

in the options interface