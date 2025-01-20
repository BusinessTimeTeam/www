#!/bin/sh
# ---
# help-text: Serve a local copy of the site
# ---
vg --var "PUBLISH=8006:8080" npx eleventy --serve
