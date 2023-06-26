#!/bin/sh

rm -rf ./dist
for folderPath in ./apps/*
do
    [ -d "${folderPath}" ] || continue
    appName="$(basename "${folderPath}")"
    echo "Building $appName..."
    nest build $appName
done