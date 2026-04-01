# [2000] Type-safe intersections?

```ts
export type StepBase = { id: string; blockId: string; outgoingEdgeId?: string }
const stepBaseSchema: JSONSchemaType<StepBase> = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    blockId: { type: 'string' },
    outgoingEdgeId: { type: 'string', nullable: true },
  },
  required: ['id', 'blockId'],
}

export type StartStep = StepBase & {
  type: 'start'
  label: string
}
const startStepSchema: JSONSchemaType<StartStep> = {
  type: 'object',
  properties: {
    ...stepBaseSchema.properties,
    type: { type: 'string', enum: ['start'] },
    label: { type: 'string' },
  },
  required: [...stepBaseSchema.required, 'label'],
}
```

Is there a way to create a schema for an intersection type without repeating the code?

The above code says: `The types of 'properties.id' are incompatible between these types.`

For union type we can use `anyOf` but what about intersection types? I tried using `allOf` but it doesn't seem to be appropriate?