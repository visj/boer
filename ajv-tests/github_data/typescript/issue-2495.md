# [2495] type `JSONSchemaType` cannot be resolved in generic/nonresolved context

**What version of Ajv are you using? Does the issue happen if you use the latest version?**
Version: "8.17.1" (Currently latest)

**Your typescript code**

```typescript
interface A<T> {
	someFunction() : JSONSchemaType<T>
}

class B<T> implements A<T> {
	
	private _schema: JSONSchemaType<T>;

	someFunction(): JSONSchemaType<T>
	{
		// gives error
		test(this);
		return this._schema;
	}
}

function test<T, TA extends A<T>>(a: TA): TA
{
	return a;
}

function testcase2<T, AT extends A<T>>(a: AT)
{
	// gives error (exactly the same)
	test(a);
}

function testcase3<T, AT extends B<T>>(a: AT)
{
	// gives error (exactly the same)
	test(a);
}

function testcase4<T>(a: A<T>)
{
	// gives error (exactly the same)
	test(a);
}

function testcase5<T>(a: B<T>)
{
	// gives error (exactly the same)
	test(a);
}
```


**Typescript compiler error messages**

```
Argument of type 'this' is not assignable to parameter of type 'A<unknown>'.
  Type 'B<T>' is not assignable to type 'A<unknown>'.
    The types returned by 'someFunction()' are incompatible between these types.
      Type 'JSONSchemaType<T>' is not assignable to type 'JSONSchemaType<unknown>'.
        Type '{ anyOf: readonly UncheckedJSONSchemaType<T, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<...> | undefined; }' is not assignable to type 'JSONSchemaType<unknown>'.
          Type '{ anyOf: readonly UncheckedJSONSchemaType<T, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<...> | undefined; }' is not assignable to type '{ type: readonly never[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<...> | undefined; }'.
            Property 'type' is missing in type '{ anyOf: readonly UncheckedJSONSchemaType<T, false>[]; } & { [keyword: string]: any; $id?: string | undefined; $ref?: string | undefined; $defs?: Record<string, UncheckedJSONSchemaType<Known, true>> | undefined; definitions?: Record<...> | undefined; }' but required in type '{ type: readonly never[]; }'.ts(2345)
```

**Explanation of code**
What I found out is that when the `T` parameter is not known/ is still a generic-type and it is passed to a generic function (like `test`). Somehow typescript cannot resolve this, eventhough in my mind everything should check out. I swapped the `JSONSchemaType` for other objects which includes generic-types. Couldn't find something simular (and less complex) which results in the same issue.

**Question and/or bugreport**
I am not sure if this is usererror (user = me), or this is because some complicated type defenition typescript cannot handle. I would love to get some feedback or hints about how to solve this.

Thanks in advance!