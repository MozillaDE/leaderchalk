#!/bin/sh
# This script pulls data and commit back to GitHub repo.

TIMESTAMP=$(date)
node --harmony index.js $1 $2
git add -f stats.json
git commit -m "Update stats.json - ${TIMESTAMP}"
git push -u origin gh-pages
