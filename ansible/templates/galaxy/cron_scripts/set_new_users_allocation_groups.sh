#!/bin/sh

cd ..
./scripts/common_startup.sh


python3 cron/set_new_users_allocation_groups.py
