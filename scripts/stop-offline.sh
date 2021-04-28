#!/usr/bin/env bash

if [[ -f .offline.pid ]]; then
  kill `cat .offline.pid`
  rm .offline.pid
fi

# Kill DynamoDB local not really a good way to kill the process.
if [[ -n $(lsof -t -i:9001) ]]; then
  kill $(lsof -t -i:9001)
fi
