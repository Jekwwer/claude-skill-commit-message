#!/usr/bin/env bash

set -euo pipefail

npm ci

pipx install pre-commit

pre-commit install --hook-type pre-commit --hook-type commit-msg
