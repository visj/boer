# [1096] Missing `dataPathArray` property in `CompilationContext` interface

The exposed `CompilationContext` interface doesn't define the `dataPathArr` property, so TypeScript throws an error where it shouldn't.