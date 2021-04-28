#!/usr/bin/env bash

TMP_OFFLINE=/tmp/offline$$.log
TMP_DYNAMODB=/tmp/dynamo$$.log

if [[ -f .offline.pid ]]; then
  echo "Found file .offline.pid. Not starting."
  exit 1
fi

NODE_OPTIONS=--max_old_space_size=8192 npx serverless dynamodb start --port=9001 --stage=test --migrate --inMemory &> ${TMP_DYNAMODB} &

while ! grep "Dynamodb Local Started" ${TMP_DYNAMODB}
do sleep 1; done

# Wait for migration data.
while ! grep "Serverless: DynamoDB - created table" ${TMP_DYNAMODB}
do sleep 1; done

NODE_OPTIONS=--max_old_space_size=8192 npx serverless offline --stage=test start --noStart &> ${TMP_OFFLINE} &

PID=$!
echo ${PID} > .offline.pid

while ! grep -e "Serverless: Offline \[HTTP\] listening on" -e "Offline listening" ${TMP_OFFLINE}
do sleep 1; done

rm ${TMP_OFFLINE}
rm ${TMP_DYNAMODB}
