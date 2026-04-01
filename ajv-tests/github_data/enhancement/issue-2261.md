# [2261] Support for discriminator tag lookup in referenced schemas

**What version of Ajv you are you using?**
8.12.0

**What problem do you want to solve?**
If the discrimantor property needs to be evaluated in a object which contains a allOf instead of direct properties, the discriminator can not be evaluated. Also the mapping param should be used if one exists.

Example of such a mapping:
```
    Song:
      description: A song
      type: object
      oneOf:
        - $ref: '#/components/schemas/InstrumentalSongObject'
        - $ref: '#/components/schemas/PopSongObject'
      discriminator:
        propertyName: type
        mapping:
          INSTRUMENTAL: '#/components/schemas/InstrumentalSongObject'
          POP: '#/components/schemas/PopSongObject'
    BaseSong:
      description: Base object
      type: object
      required:
        - title
      properties:
        title:
          description: The title
          type: string
    InstrumentalSong:
      description: 'Instrumental Song'
      required:
        - type
      type: object
      properties:
        type:
          type: string
          description: Song type
          enum:
            - INSTRUMENTAL
          example: INSTRUMENTAL
        band:
          description: The band
          type: string
    PopSong:
      description: 'Pop song'
      required:
        - type
      type: object
      properties:
        type:
          type: string
          description: Song type
          enum:
            - POP
          example: POP
        artist:
          description: The artist
          type: string
    InstrumentalSongObject:
      description: A instrumental song
      type: object
      allOf:
        - $ref: '#/components/schemas/BaseSong'
        - $ref: '#/components/schemas/InstrumentalSong'
    PopSongObject:
      description: A pop song
      type: object
      allOf:
        - $ref: '#/components/schemas/BaseSong'
        - $ref: '#/components/schemas/PopSong'
```

**What do you think is the correct solution to problem?**
the getMapping function in the package discriminator needs to be extended tu support allOf for evaluation of the discriminator in the props of these subobjects.

**Will you be able to implement it?**
yes, PR will follow