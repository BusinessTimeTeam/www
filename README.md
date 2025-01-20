# www.businesstime.team

## Local development

You'll need the vantage task runner (https://github.com/vantage-org/vantage)

Then clone this repo and point your terminal at the directory. Then run this
one-time set up:

```
$ vg __init
$ vg bootstrap
```

Then if you want the local debug server running you just need to run `vg serve`.
The website will be hosted on localhost:8006.

If you want to run an npm command (to install a dependenacy or something), then
use `vg npm COMMAND`, similarly for `vg npx COMMAND`.
