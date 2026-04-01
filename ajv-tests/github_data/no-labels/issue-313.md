# [313] Validation of array of objects

**What version of Ajv you are you using?**

the latest code from git

**What problem do you want to solve?**
I will like to validate an array of object or simple values from a set of objects or values. Let me give an example,

I like to validate this array:

```
A = [
{
  a:"a",
 b:"b",
},
{
  c:"c".
d:"d"
},
{
 f:"f",
e:"e"
}
]
```

so that its values are drawn from another array but in different order and different field names:

```
B= [
{
 finput:"f",
einput:"e"
},
{
  cinput:"c".
dinput:"d"
},
{
  ainput:"a",
 binput:"b",
}
]
```

As you can see, all elements in in array A are stored in in array B with different field names and in different order. The first element of A is equal to the third element of B :field a value are same as field ainput and field b for binput.

**What do you think is the correct solution to problem?**

One to one validation is simple. but we need to search one object element in another array. I don't see any ready keywords to achieve this.

**Will you be able to implement it?**

If somebody give little hint, yes I can do it and post back to this project,
