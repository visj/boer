# [5] Resolve previously missing references when additional schemas are compiled

That will enable mutual (circular) references between schemas.
That is more complex than it seems because resolution could fail in the middle of resolution chain and the newly added schema may not contain the required reference but be inside some resolution chains.
So the resolutions that were stopped because they couldn't find the newly added schema (and also any IDs contained in it - another complication) have to be re-tried.
