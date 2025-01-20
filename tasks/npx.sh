#!/bin/sh
# ---
# help-text: Run an npx command
# image:
#   tag: node:lts
#   workdir: /workdir
#   volume:
#     - $VG_APP_DIR:/workdir
#   publish:
#     - $PUBLISH
# environment:
#   - PUBLISH=8080
# ---
set -eu
npx "${@:---help}"
