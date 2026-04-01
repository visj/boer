# [1878] Error when using a large JSON schema for compilation 

I  am using schema file :- https://schemas.testnet.verida.io/health/fhir/4.0.1/schema.json 
 When this reached to this point `ajv.compileAsync(/*jsonSchema/*)` it throws the error below

Node version :- 14.17.1
OS :- Ubuntu 20.04
AJV versions :-     
     ```
    "ajv": "^8.6.3",
    "ajv-formats": "^2.1.1",
    ```

Error
```bash
FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory
 1: 0xa24ed0 node::Abort() [node]
 2: 0x966115 node::FatalError(char const*, char const*) [node]
 3: 0xb9acde v8::Utils::ReportOOMFailure(v8::internal::Isolate*, char const*, bool) [node]
 4: 0xb9b057 v8::internal::V8::FatalProcessOutOfMemory(v8::internal::Isolate*, char const*, bool) [node]
 5: 0xd56ea5  [node]
 6: 0xd57a2f  [node]
 7: 0xd65abb v8::internal::Heap::CollectGarbage(v8::internal::AllocationSpace, v8::internal::GarbageCollectionReason, v8::GCCallbackFlags) [node]
 8: 0xd6967c v8::internal::Heap::AllocateRawWithRetryOrFailSlowPath(int, v8::internal::AllocationType, v8::internal::AllocationOrigin, v8::internal::AllocationAlignment) [node]
 9: 0xd2ee1d v8::internal::Factory::AllocateRaw(int, v8::internal::AllocationType, v8::internal::AllocationAlignment) [node]
10: 0xd2b079 v8::internal::FactoryBase<v8::internal::Factory>::AllocateRawArray(int, v8::internal::AllocationType) [node]
11: 0xd3d510 v8::internal::Handle<v8::internal::FixedArray> v8::internal::Factory::CopyArrayAndGrow<v8::internal::FixedArray>(v8::internal::Handle<v8::internal::FixedArray>, int, v8::internal::AllocationType) [node]
12: 0xf4cac0 v8::internal::FrameArray::AppendJSFrame(v8::internal::Handle<v8::internal::FrameArray>, v8::internal::Handle<v8::internal::Object>, v8::internal::Handle<v8::internal::JSFunction>, v8::internal::Handle<v8::internal::AbstractCode>, int, int, v8::internal::Handle<v8::internal::FixedArray>) [node]
13: 0xcf503b v8::internal::FrameArrayBuilder::AppendAsyncFrame(v8::internal::Handle<v8::internal::JSGeneratorObject>) [node]
14: 0xcf568f v8::internal::CaptureAsyncStackTrace(v8::internal::Isolate*, v8::internal::Handle<v8::internal::JSPromise>, v8::internal::FrameArrayBuilder*) [node]
15: 0xcf63fe  [node]
```



Implementation 
```javascript
  public async validate(data: any): Promise<boolean> {
    if (!this.validateFunction) {
      const schemaJson = await this.getSchemaJson();
      // @todo: Fix schemas to have valid definitions and then enable strict compile
      this.validateFunction = await this.ajv.compileAsync(schemaJson);
    }

    const valid = await this.validateFunction(data);
    if (!valid) {
      this.errors = this.validateFunction.errors;
    }

    return valid;
  }
```

github URL with test :- https://github.com/verida/verida-js/blob/fix/schema_validation_error/packages/client-ts/test/validate.tests.ts 