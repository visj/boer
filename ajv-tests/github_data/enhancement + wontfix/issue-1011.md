# [1011] Add format to support ISO 8601 Duration

**What version of Ajv you are you using?**
6.5.3

**What problem do you want to solve?**
Add new format 'duration' as ISO 8601 Duration

**What do you think is the correct solution to problem?**
This improvement just need to update lib/compile/formats.js:
  - Add ISO Duration regex as constants
  - Add this regex to format.fast.duration and format.full.duration

**Will you be able to implement it?**
With pleasure