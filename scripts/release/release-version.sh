#!/bin/bash
# Copyright (C) 2022-2024  Luxembourg Institute of Science and Technology
#
# App4Cam is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# App4Cam is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with App4Cam.  If not, see <https://www.gnu.org/licenses/>.

NEW_VERSION="$1"

# Make sure that you are on the main branch.
if [[ "$(git branch --show-current)" != 'main' ]]; then
  echo 'You are not on the main branch!'
  exit 1
fi

# Check whether everything is committed.
if [ -n "$(git status --porcelain)" ]; then
  echo 'You have uncommitted changes!'
  exit 1
fi

# Check whether it is up-to-date.
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse "@{u}")
if [ "$LOCAL" != "$REMOTE" ]; then
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
