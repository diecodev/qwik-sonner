#!/bin/sh
# Vercel's Ignored Build Step (`ignoreCommand` in vercel.json), for the previews: Vercel builds nothing from Git for
# the production branch, whose deploys come from .github/workflows/website.yml. Exit 0 skips the build and 1 builds
# it: a branch gets a preview only when it changes the website or vercel.json, compared with the production branch.
# When that can't be told, it builds.
base="v2" # the production branch; main once v2 merges
repo="https://github.com/${VERCEL_GIT_REPO_OWNER:-diecodev}/${VERCEL_GIT_REPO_SLUG:-qwik-sonner}.git"
git fetch --quiet --depth=50 "$repo" "$base" || exit 1
merge_base=$(git merge-base HEAD FETCH_HEAD) || exit 1
git diff --quiet "$merge_base" HEAD -- website vercel.json && exit 0
exit 1
