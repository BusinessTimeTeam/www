#!/bin/sh
# ---
# help-text: Run an npm command
# image:
#   tag: node:lts
#   workdir: /workdir
#   volume:
#     - $VG_APP_DIR:/workdir
# ---
set -eu
npm "${@:---help}"
