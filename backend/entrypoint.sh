#!/bin/bash
set -e

# PIDファイルが残っている場合は削除
rm -f /app/tmp/pids/server.pid

exec "$@"
