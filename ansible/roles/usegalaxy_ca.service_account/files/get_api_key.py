#!/usr/bin/python
"""
This script is used to get the API key for the Galaxy Admin user and set it as a Doppler secret.

Usage:
python get_api_key.py -g https://usegalaxy.org -p password -e email
"""
import bioblend.galaxy
import argparse
import subprocess
import os

"""
Run a command in a subprocess
"""
def run_command(command):
    env = os.environ.copy()
    env.update(env)
    p = subprocess.Popen(command, shell=False, env=env)
    p.communicate()

"""
Get the API key for the Galaxy Admin user
"""
def set_api_key(key):
    print("Setting API key as Doppler secret")
    command = ["doppler", "--no-check-version", "secrets", "set", "GALAXY_ADMIN_API_KEY", key]
    run_command(command)

def main():
    args = argparse.ArgumentParser()
    args.add_argument('--galaxy-url', '-g', help='Galaxy URL', required=True)
    args.add_argument('--password', '-p', help='Password', required=True)
    args.add_argument('--email', '-e', help='Email', required=True)

    args = args.parse_args()
    gi = bioblend.galaxy.GalaxyInstance(url=args.galaxy_url, email=args.email, password=args.password)
    set_api_key(gi.key)

   

if __name__ == '__main__':
    main()
