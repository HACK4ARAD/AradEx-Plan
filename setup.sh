#!/usr/bin/env sh
# Pune lângă AradEx-Plan repo-urile surori care lipsesc (git clone) sau le actualizează (git pull),
# și activează în toate hook-ul care scoate `Co-Authored-By:` din commit-uri.
# Rulează din AradEx-Plan:  ./setup.sh
set -e
cd "$(dirname "$0")"
ORG_URL="${ORG_URL:-https://github.com/HACK4ARAD}"

git config core.hooksPath .githooks
echo "→ AradEx-Plan: git pull"; git pull --ff-only || echo "  (nu s-a putut face pull — ai modificări locale? continui)"

for repo in AradEx-Backend AradEx-Frontend AradEx-Infrastructure AradEx-Ops; do
  dir="../$repo"
  if [ -d "$dir/.git" ]; then
    echo "→ $repo: git pull"; (cd "$dir" && git pull --ff-only) || echo "  (nu s-a putut face pull în $repo — continui)"
  elif [ -d "$dir" ]; then
    echo "→ $dir există, dar nu e repo git — mută-l sau șterge-l și rulează din nou"; continue
  else
    echo "→ $repo: git clone"; git clone "$ORG_URL/$repo.git" "$dir"
  fi
  git -C "$dir" config core.hooksPath .githooks
done

echo "gata. Următorul pas: cp ../AradEx-Backend/.env.example ../AradEx-Backend/.env && (cd ../AradEx-Infrastructure && docker compose up -d) && (cd ../AradEx-Backend && ./gradlew :app:bootRun)"
