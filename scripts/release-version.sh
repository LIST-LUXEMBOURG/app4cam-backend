#!/bin/bash
# © 2024 Luxembourg Institute of Science and Technology

NEW_VERSION="$1"

# Make sure that you are on the main branch.
if [[ "$(git branch --show-current)" != 'main' ]]
then
  echo 'You are not on the main branch!'
  exit 1
fi

# Check whether everything is committed.
if [ -n "$(git status --porcelain)" ]
then
  echo 'You have uncommitted changes!'
  exit 1
fi

# Check whether it is up-to-date.
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "@{u}")
if [ "$LOCAL" != "$REMOTE" ]
then
  echo 'Your local repository is not up-to-date!'
  exit 1
fi

# Update version in package files, commit and tag.
npm version "$NEW_VERSION" -m "release version $NEW_VERSION"

# Push the commit to the remote repository.
git push

# Push the tag to the remote repository.
git push --tags

# Append -next to the version number in package files, and commit.
npm version "$NEW_VERSION-next" --no-git-tag-version
git commit -am "prepare next release" --no-verify
