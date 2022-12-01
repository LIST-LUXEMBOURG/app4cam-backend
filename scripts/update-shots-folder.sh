#!/bin/bash

echo "udiskie event: $1"
echo "shots folder: $2"

if [ "$1" != "device_mounted" ]
then
  exit 1
fi

curl -X PUT -H "Content-Type: application/json" -d "{\"shotsFolder\":\"${2}\"}" "http://127.0.0.1:3000/settings/shotsFolder"
