#!/usr/bin/python
"""
Register a user on a Galaxy instance

Example usage:
python register.py -u username -p password -e email -c postgresql://username:password@host:port/dbname
"""
import argparse
import psycopg2
import logging

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
