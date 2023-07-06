#!/usr/bin/python
"""
Register a user on a Galaxy instance

Example usage:
python register.py -g https://usegalaxy.org -u username -p password -e email
"""
import argparse
import requests
import re
import os.path as path

"""
Galaxy class

Attributes:
    url: The url of the Galaxy instance
    session: A requests session object
    csrf_token: The csrf token for the session
"""
class Galaxy:
    def __init__(self, url):
        self.url = url
        self.session = requests.Session()
        self.csrf_token = self._get_csrf_token()

    """
    Get the csrf token for the session
    """
    def _get_csrf_token(self):
        res = self.session.get(self.url, timeout=10, verify=True)
        m = re.search('"session_csrf_token": "([a-zA-Z0-9]+)"', res.text)
        if m and m.group(1):
            return m.group(1)
        else:
            raise Exception('Could not find csrf token')

    """
    Create a user on the Galaxy instance
    """
    def create_user(self, username, password, email):
        endpoint = path.join(self.url, 'user/create')
        res = self.session.post(endpoint, json={
          "email": email,
          "username": username,
          "password": password,
          "confirm": password,
          "subscribe": None,
          "session_csrf_token": self.csrf_token
        }, timeout=10, verify=True)
        print(res.text)

def main():
    args = argparse.ArgumentParser()
    args.add_argument('--galaxy-url', '-g', help='Galaxy URL', required=True)
    args.add_argument('--username', '-u', help='Username', required=True)
    args.add_argument('--password', '-p', help='Password', required=True)
    args.add_argument('--email', '-e', help='Email', required=True)
    
    args = args.parse_args()
    galaxy = Galaxy(args.galaxy_url)
    galaxy.create_user(args.username, args.password, args.email)

if __name__ == '__main__':
    main()
