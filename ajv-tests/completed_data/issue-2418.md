# [2418] compileParser does not appear to support properties with type `field?: Record<string, unknown>` via `JTDSchemaType`.

*What version of Ajv are you using? Does the issue happen if you use the latest version?**

8.12.0

**Ajv options object**

none

```typescript
import Ajv, { JTDSchemaType } from 'ajv/dist/jtd'

const ajv = new Ajv()
```

**JSON Schema**

```typescript
export interface IRequest {
    work_type: string,
    meta?: Record<string, unknown>
}

const RequestJDTSchema: JTDSchemaType<IRequest> = {
    properties: {
        work_type: { type: 'string' },
    },
    optionalProperties: {
        meta: { values: {}, nullable: false  },
    }
}
```

**Sample data**

<!-- Please make it as small as possible to reproduce the issue -->

```json
{
  "work_type": "example.integration.2',"
  "meta": {
    "picks": [],
    "picks_error": []
  }
}
```

**Your code**

NOTE: could not reproduce this in Jest, only in the browser - as such the code is a Lit element that allows interaction to reproduce the issue.  I could not work out how to write a standalone automated test to produce the same error.

```javascript
import { LitElement, html, nothing } from 'lit'
import { customElement, state } from 'lit/decorators.js'
import Ajv, { JTDSchemaType } from 'ajv/dist/jtd'

const ajv = new Ajv()

export interface IRequest {
    work_type: string,
    meta?: Record<string, unknown>
}

const RequestJDTSchema: JTDSchemaType<IRequest> = {
    properties: {
        work_type: { type: 'string' },
    },
    optionalProperties: {
        meta: { values: {}, nullable: false  },
    }
}

export const serializeRequest = ajv.compileSerializer<IRequest>(RequestJDTSchema)

export const parseRequest = ajv.compileParser<IRequest>(RequestJDTSchema)

const jsonTextBad = serializeRequest({
  work_type: 'example.integration.2',
  meta: {
    picks: [],
    picks_error: []
  }
})

const jsonTextGood = serializeRequest({
  work_type: 'example.integration.2',
})

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {

  @state()
  private errorText: string | undefined
  private request: IRequest | undefined

  render() {
    return html`
      <div>
      <button @click=${this._onBad}>attempt validation of fail case</button>
      <button @click=${this._onGood}>attempt validation of success case</button>
        ${this.errorText
        ? html`<h3>error text</h3>
        <pre>${this.errorText}</pre>`
        : nothing
      }
      ${this.request
        ? html`<h3>request</h3>
        <pre>${JSON.stringify(this.request, null, 2)}</pre>`
        : nothing
      }
      </div>
    `
  }

  private _onGood() {
    this.errorText = undefined
    this.request = parseRequest(jsonTextGood)
    if (!this.request) {
      this.errorText = `${parseRequest.position}: ${parseRequest.message}`
    }
  }

  private _onBad() {
    this.errorText = undefined
    this.request = parseRequest(jsonTextBad)
    if (!this.request) {
      this.errorText = `${parseRequest.position}: ${parseRequest.message}`
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}

```

**Validation result, data AFTER validation, error messages**

```
74: unexpected end
```

**What results did you expect?**

Json was valid (especially given it is created via the compiled serializer)

**Are you going to resolve the issue?**

I honestly have no idea how this might be resolved.  For now I'm working around it in my code by not using compileParser for this particular schema.