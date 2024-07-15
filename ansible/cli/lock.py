import fcntl

"""
Lock class to acquire a lock on a file. 
The lock is released when the object is destroyed.
If the lock is already acquired, it raises a LockAlreadyAcquiredError.
"""
class Lock:
    def __init__(self, file):
        self.lockfile = file
        self.lock = None

    def acquire(self):
        try:
            self.lock = open(self.lockfile, 'w')
            fcntl.flock(self.lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise LockAlreadyAcquiredError()

"""
Error raised when the lock is already acquired.
"""
class LockAlreadyAcquiredError(Exception):
    pass
