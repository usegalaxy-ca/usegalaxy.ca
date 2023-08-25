#! /usr/bin/env bash
set -e

API_KEY=$1

source .venv/bin/activate
shed-tools install -g https://jl-galaxy.usegalaxy.ca -a $API_KEY -t files/galaxy/tool_list.yml
