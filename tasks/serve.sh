#!/bin/sh
# ---
# help-text: Serve a local copy of the site
# ---
vg --var "PUBLISH=8006:8006" npx eleventy --serve --port 8006
