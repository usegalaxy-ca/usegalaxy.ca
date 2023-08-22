#!/usr/bin/python
"""
Register a user on a Galaxy instance

Example usage:
python register.py -u username -p password -e email -c postgresql://username:password@host:port/dbname
"""
import argparse
from collections.abc import ByteString
import psycopg2
import logging
import hashlib
from base64 import b64encode
from os import urandom
from typing import (
    Any,
    Iterable,
    Iterator,
    List,
    Optional,
    overload,
    Tuple,
    TypeVar,
    Union,
)

DEFAULT_ENCODING = "utf-8"
SALT_LENGTH = 12
KEY_LENGTH = 24
HASH_FUNCTION = "sha256"
COST_FACTOR = 100000


def smart_str(s, encoding=DEFAULT_ENCODING, errors="strict") -> bytes:
    """
    Returns a bytestring version of 's', encoded as specified in 'encoding'.

    If strings_only is True, don't convert (some) non-string-like objects.

    Adapted from an older, simpler version of django.utils.encoding.smart_str.

    >>> assert smart_str(None) == b'None'
    >>> assert smart_str(None, strings_only=True) is None
    >>> assert smart_str(3) == b'3'
    >>> assert smart_str(3, strings_only=True) == 3
    >>> s = b'a bytes string'; assert smart_str(s) == s
    >>> s = bytearray(b'a bytes string'); assert smart_str(s) == s
    >>> assert smart_str('a simple unicode string') == b'a simple unicode string'
    >>> assert smart_str('à strange ünicode ڃtring') == b'\\xc3\\xa0 strange \\xc3\\xbcnicode \\xda\\x83tring'
    >>> assert smart_str(b'\\xc3\\xa0n \\xc3\\xabncoded utf-8 string', encoding='latin-1') == b'\\xe0n \\xebncoded utf-8 string'
    >>> assert smart_str(bytearray(b'\\xc3\\xa0n \\xc3\\xabncoded utf-8 string'), encoding='latin-1') == b'\\xe0n \\xebncoded utf-8 string'
    """
    if not isinstance(s, (str, bytes, bytearray)):
        s = str(s)
    # Now s is an instance of str, bytes or bytearray
    if not isinstance(s, (bytes, bytearray)):
        return s.encode(encoding, errors)
    elif s and encoding != DEFAULT_ENCODING:
        return s.decode(DEFAULT_ENCODING, errors).encode(encoding, errors)
    else:
        return s

def pbkdf2_bin(data, salt, iterations=COST_FACTOR, keylen=KEY_LENGTH, hashfunc=HASH_FUNCTION):
    """Returns a binary digest for the PBKDF2 hash algorithm of `data`
    with the given `salt`.  It iterates `iterations` time and produces a
    key of `keylen` bytes.  By default SHA-256 is used as hash function,
    a different hashlib `hashfunc` can be provided.
    """
    data = smart_str(data) 
    salt = smart_str(salt)

    return hashlib.pbkdf2_hmac(hashfunc, data, salt, iterations, keylen)

def unicodify(
    value: Any,
    encoding: str = DEFAULT_ENCODING,
    error: str = "replace",
    strip_null: bool = False,
) -> Optional[str]:
    """
    Returns a Unicode string or None.

    >>> assert unicodify(None) is None
    >>> assert unicodify('simple string') == 'simple string'
    >>> assert unicodify(3) == '3'
    >>> assert unicodify(bytearray([115, 116, 114, 196, 169, 195, 177, 103])) == 'strĩñg'
    >>> assert unicodify(Exception('strĩñg')) == 'strĩñg'
    >>> assert unicodify('cómplǐcḁtëd strĩñg') == 'cómplǐcḁtëd strĩñg'
    >>> s = 'cómplǐcḁtëd strĩñg'; assert unicodify(s) == s
    >>> s = 'lâtín strìñg'; assert unicodify(s.encode('latin-1'), 'latin-1') == s
    >>> s = 'lâtín strìñg'; assert unicodify(s.encode('latin-1')) == 'l\ufffdt\ufffdn str\ufffd\ufffdg'
    >>> s = 'lâtín strìñg'; assert unicodify(s.encode('latin-1'), error='ignore') == 'ltn strg'
    """
    if value is None:
        return value
    if isinstance(value, bytearray):
        value = bytes(value)
    elif not isinstance(value, (str, bytes)):
        value = str(value)
    # Now value is an instance of bytes or str
    if not isinstance(value, str):
        value = str(value, encoding, error)
    if strip_null:
        return value.replace("\0", "")
    return value

def hash_password_PBKDF2(password):
    # Generate a random salt
    salt = b64encode(urandom(SALT_LENGTH))
    # Apply the pbkdf2 encoding
    hashed_password = pbkdf2_bin(password, salt, COST_FACTOR, KEY_LENGTH, HASH_FUNCTION)
    encoded_password = unicodify(b64encode(hashed_password))
    # Format
    return f"PBKDF2${HASH_FUNCTION}${COST_FACTOR}${unicodify(salt)}${encoded_password}"

def get_args():
    args = argparse.ArgumentParser()
    args.add_argument('--username', '-u', help='Username', required=True)
    args.add_argument('--password', '-p', help='Password', required=True)
    args.add_argument('--email', '-e', help='Email', required=True)
    args.add_argument('--connect', '-c', help='Database connection string eg: postgresql://username:password@host:port/dbname', required=True)
    
    return args.parse_args()

def main():
    args = get_args()

    config = Config(args.connect)
    galaxy = Galaxy(config)
    galaxy.create_user(args.username, args.password, args.email)


class DB:
    def __init__(self, config):
        self.config = config
        self._connect()

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.__del__()

    def _connect(self):
        try:
            logging.info('Connecting to database')
            self.conn = psycopg2.connect(
                host=self.config.url,
                port=self.config.port,
                database='galaxy',
                user=self.config.username,
                password=self.config.password
            )
            self.cur = self.conn.cursor()
        except (Exception, psycopg2.DatabaseError) as error:
            raise Exception('An error occurred while connecting to the database:\n' + str(error))

    def __del__(self):
        logging.info('Closing database connection')
        if self.cur is not None:
            self.cur.close()
        if self.conn is not None:
            self.conn.close()

    def insert_user(self, username: str, password: str, email: str):
        logging.info(f'Inserting user {username} into database')
        
        password = hash_password_PBKDF2(password)

        self._insert_user(username, password, email)
        self.conn.commit()

        user_id = self._get_user_id(username)
        self._insert_user_role(user_id)
        self.conn.commit()

        logging.info(f'User {username} inserted into database')

    def _insert_user(self, username: str, password: str, email: str):
        self.cur.execute(
            'INSERT INTO galaxy_user (email, username, password, active) VALUES (%s, %s, %s, true) ON CONFLICT DO NOTHING',
            (email, username, password)
        )

    def _get_user_id(self, username: str):
        self.cur.execute(
            'SELECT id FROM galaxy_user WHERE username = %s',
            (username,)
        )
        user_id = self.cur.fetchone()
        if user_id is None:
            raise Exception('Unable to retrieve user id')
        return user_id[0]

    def _insert_user_role(self, user_id: str):
        self.cur.execute(
            "INSERT INTO user_role_association (user_id, role_id) VALUES (%s, (SELECT id FROM role WHERE name = 'admin')) ON CONFLICT DO NOTHING",
            (user_id,)
        )



class Galaxy:
    def __init__(self, config):
        self.config = config
        self.db = DB(config)

    def create_user(self, username: str, password: str, email: str):
        self.db.insert_user(username, password, email)


class Config():
    url: str
    port: int
    username: str
    password: str

    def __init__(self, connect: str):
        # postgresql://username:password@host:port/dbname
        try:
            s = connect.split('://', 1)
            self.protocol = s[0]
            s = s[1].split(':', 1)
            self.username = s[0]
            s = s[1].split('@', 1)
            self.password = s[0]
            s = s[1].split(':', 1)
            self.url = s[0]
            s = s[1].split('/', 1)
            self.port = int(s[0])
            self.database = s[1]
        except Exception as e:
            raise Exception('An error occurred while parsing the database connection string:\n' + str(e))

        if self.protocol != 'postgresql':
            raise Exception('Only postgresql is supported')
        if self.database != 'galaxy':
            raise Exception('Only the galaxy database is supported')
        if self.url == '':
            raise Exception('No url provided')
        if self.port == '':
            raise Exception('No port provided')
        if self.username == '':
            raise Exception('No username provided')
        if self.password == '':
            raise Exception('No password provided')




if __name__ == '__main__':
    main()
