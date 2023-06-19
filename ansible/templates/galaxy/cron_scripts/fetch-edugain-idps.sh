#!/bin/sh
curl --fail --silent https://technical.edugain.org/api.php?action=list_entities -H "Accept: application/json" --output edugain_idps.json
