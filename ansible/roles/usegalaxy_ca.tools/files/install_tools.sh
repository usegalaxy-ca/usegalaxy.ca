#! /usr/bin/env bash
set -e

DOMAIN=$1
API_KEY=$2

source .venv/bin/activate
shed-tools install -g https://$DOMAIN -a $API_KEY -t files/galaxy/tool_list.yml
