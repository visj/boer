# [1838] Create two JSONSchemaType from two interfaces in Typescript where one extends from the other

I'm using Ajv with Typescript and I'd like to create a JSONSchemaType from another. I have two interfaces (one of them extends from another) and I would like to do somethig similar with Ajv for form validation. I don't know if this is possible or I do have to replicate the code.

Here is an example:
```
export interface IAddressBookBase {
  id?: number;
  address: string;
  clientReference: string;
}

export interface IAddressBook extends IAddressBookBase {
  name: string;
}
```

And their schemas:
```
export const addressBookBaseSchema: JSONSchemaType<IAddressBookBase> = {
  type: 'object',
  properties: {
    id: { type: 'integer', nullable: true },
    address: { type: 'string' },
    clientReference: { type: 'string' },
  },
  required: ['clientReference'],
};

export const addressBookSchema: JSONSchemaType<IAddressBook> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  required: ['name'],
};
```

I tried using spread operator and looked for help on the Internet but I wasn't lucky. Some help would be appreciated.