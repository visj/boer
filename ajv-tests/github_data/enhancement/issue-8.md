# [8] Caching limit and strategy

Hey, just wanted to say nice work on the performance improvements! It's great to see there's no upper limit in how fast a JSON validator for node can go. Caching the validator code internally is great and I guess does the trick for the benchmarks out there.

I was wondering, do you plan on introducing some caching configuration? A limit on the size/number of cached validator code, maybe together with some policy for purging stale validators (e.g. least recently used)? That would help a great deal in large-scale projects with lots of schemas, or when schemas are dynamically generated and can change a lot.

Keep up the good work!
