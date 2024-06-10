#! /usr/bin/env bash
set -e

DOMAIN=$1
API_KEY=$2

source .venv/bin/activate
python files/galaxy/roles/usegalaxy_ca.tools/files/tool_list.py
