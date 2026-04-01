# [395] Why not coerce string 1 and 0?

Hi folks, I just have a question for you. I'm a contributor to a similar project as this one, written in PHP. We've recently added support for type coercion, and a few days ago someone submitted a PR with the aim of supporting coercion of string "1" and "0" to boolean. 

https://github.com/justinrainbow/json-schema/pull/345

I've been arguing against it, but with a flawed rationale (I was unaware that [http_build_query ](http://php.net/manual/en/function.http-build-query.php)converts true and false to string 1 and 0). 

I've studied your coercion grid carefully, and if I understand correctly you do NOT coerce string 1 and 0 to boolean. I was wondering if you could explain your reasoning? Thanks much!