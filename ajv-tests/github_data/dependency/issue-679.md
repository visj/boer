# [679] Help?  AJV compile() async schema ultra-slow on node 4.6.0

Using AJV 6.0.0 with node 4.6.0 (LTS release), comparing with node 8.9.0.

On node 4.6.0 compiling lengthy schema (4500 lines) with async support ("$async" keyword) takes an extreme amount of cycles and realtime (over 2 minutes at 95% CPU) compared to node 8.9.0 (less than one second).  Profiling suggests something in nodent-compile is provoking something in node.  (Problem occurs on both Windows and Linux on different computers.)

If I cut the schema down by half (2200 lines), that reduces churn so compile() takes around 15 seconds (so scaling isn't linear).

If you like I will try to create small test case which clearly shows problem rather than upload thousands of lines of schema here.

After compile() runs the validate function seems to work fine and quickly too.

Top few lines from output of v4.6.0 node --prof-process:

Code move event for unknown code: 0x208b098e1c0
Code move event for unknown code: 0x208b098fa80
Code move event for unknown code: 0x208b0840500
Statistical profiling result from isolate-0000026088F02B90-v8.log, (7427 ticks, 3689 unaccounted, 0 excluded).

 [Shared libraries]:
   ticks  total  nonlib   name

 [JavaScript]:
   ticks  total  nonlib   name
   1039   14.0%   14.0%  LazyCompile: *InnerArrayIndexOf native array.js:1031:27
    551    7.4%    7.4%  Stub: CompareICStub {2}
    269    3.6%    3.6%  Stub: CompareICStub {3}
    221    3.0%    3.0%  KeyedLoadIC: A keyed load IC from the snapshot
    145    2.0%    2.0%  LazyCompile: *<anonymous> XXXX\src\nodejs\node_modules\nodent-compiler\lib\arboriculture.js:947:52
    111    1.5%    1.5%  LazyCompile: *down XXXX\src\nodejs\node_modules\nodent-compiler\lib\parser.js:146:52
    109    1.5%    1.5%  Stub: InstanceofStub_INLINE
     84    1.1%    1.1%  LazyCompile: ~descend XXXX\src\nodejs\node_modules\nodent-compiler\lib\parser.js:141:21
     66    0.9%    0.9%  LazyCompile: IN native runtime.js:352:15
     65    0.9%    0.9%  LazyCompile: ~down XXXX\src\nodejs\node_modules\nodent-compiler\lib\parser.js:146:52
     56    0.8%    0.8%  Stub: LoadICStub
     51    0.7%    0.7%  LazyCompile: ~goDown XXXX\src\nodejs\node_modules\nodent-compiler\lib\parser.js:127:20
     43    0.6%    0.6%  Stub: CEntryStub
     42    0.6%    0.6%  LazyCompile: *isArray native array.js:1194:22
     33    0.4%    0.4%  LazyCompile: *goDown XXXX\src\nodejs\node_modules\nodent-compiler\lib\parser.js:127:20
     26    0.4%    0.4%  LazyCompile: *DefineObjectProperty native v8natives.js:461:30
     25    0.3%    0.3%  KeyedLoadIC: A keyed load IC from the snapshot {1}
     23    0.3%    0.3%  Stub: CallFunctionStub
     22    0.3%    0.3%  Stub: FastNewClosureStub
     22    0.3%    0.3%  LazyCompile: *ToPropertyDescriptor native v8natives.js:234:30
     22    0.3%    0.3%  LazyCompile: *ToName native runtime.js:578:16
     20    0.3%    0.3%  Stub: CallFunctionStub {1}
     20    0.3%    0.3%  Builtin: ArgumentsAdaptorTrampoline
     18    0.2%    0.2%  LazyCompile: ~base.Program.base.BlockStatement XXXX\src\nodejs\node_modules\acorn\dist\walk.js:190:47
     17    0.2%    0.2%  Stub: InstanceofStub
     17    0.2%    0.2%  Stub: CallConstructStub
     17    0.2%    0.2%  LazyCompile: INSTANCE_OF native runtime.js:364:33
     16    0.2%    0.2%  LazyCompile: *PropertyDescriptor native v8natives.js:281:28
     16    0.2%    0.2%  Handler: valid3 {2}
     15    0.2%    0.2%  LazyCompile: *defineProperties native v8natives.js:798:32
     15    0.2%    0.2%  LazyCompile: *GetOwnEnumerablePropertyNames native v8natives.js:780:39
     15    0.2%    0.2%  Builtin: JSConstructStubGeneric
     14    0.2%    0.2%  LazyCompile: *ConvertDescriptorArrayToDescriptor native v8natives.js:374:44
     12    0.2%    0.2%  LazyCompile: EQUALS native runtime.js:75:23
     12    0.2%    0.2%  LazyCompile: *treeWalker XXXX\src\nodejs\node_modules\nodent-compiler\lib\parser.
js:119:20
     12    0.2%    0.2%  LazyCompile: *indexOf native array.js:1076:22
     12    0.2%    0.2%  LazyCompile: *ToString native runtime.js:563:18
     12    0.2%    0.2%  LazyCompile: *<anonymous> XXXX\src\nodejs\node_modules\nodent-compiler\lib\arbori
culture.js:1195:45
      9    0.1%    0.1%  LazyCompile: *IsDataDescriptor native v8natives.js:187:26
      9    0.1%    0.1%  LazyCompile: *InnerArraySome native array.js:949:24
      9    0.1%    0.1%  Handler: An IC handler from the snapshot {4}
      8    0.1%    0.1%  Stub: CompareICStub
      8    0.1%    0.1%  LazyCompile: *InnerArrayForEach native array.js:924:27
      7    0.1%    0.1%  LazyCompile: contains XXXX\src\nodejs\node_modules\nodent-compiler\lib\arboricult
ure.js:115:18
      7    0.1%    0.1%  LazyCompile: *IsGenericDescriptor native v8natives.js:191:29
      7    0.1%    0.1%  LazyCompile: *<anonymous> XXXX\src\nodejs\node_modules\nodent-compiler\lib\arbori
culture.js:2670:46
      7    0.1%    0.1%  Handler: An IC handler from the snapshot {1}
      6    0.1%    0.1%  Stub: CompareICStub {1}
      6    0.1%    0.1%  LazyCompile: *base.MethodDefinition.base.Property XXXX\src\nodejs\node_modules\ac
orn\dist\walk.js:408:50
      6    0.1%    0.1%  LazyCompile: *PropertyDescriptor_HasGetter native v8natives.js:360:50
      6    0.1%    0.1%  Handler: valid3 {1}
      6    0.1%    0.1%  Handler: An IC handler from the snapshot {3}
      6    0.1%    0.1%  Handler: An IC handler from the snapshot {2}
      5    0.1%    0.1%  Stub: CallFunctionStub_Args0
      5    0.1%    0.1%  LazyCompile: *IsInconsistentDescriptor native v8natives.js:195:34
      5    0.1%    0.1%  Handler: remove {1}
      5    0.1%    0.1%  Handler: An IC handler from the snapshot {11}
      4    0.1%    0.1%  Stub: RegExpExecStub
      4    0.1%    0.1%  LazyCompile: ~base.NewExpression.base.CallExpression XXXX\src\nodejs\node_modules
\acorn\dist\walk.js:360:53
      4    0.1%    0.1%  LazyCompile: ~base.AssignmentExpression.base.AssignmentPattern XXXX\src\nodejs\node_modules\acorn\dist\walk.js:351:63