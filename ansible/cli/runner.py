"""
This file contains the Runner class which is used to run commands in a subprocess
"""
import os
import subprocess

class Runner:
    """
    Run a command in a subprocess
    """
    def run_cmd(self, command: list[str], env = {}) -> None:
        env = os.environ.copy()
        env.update(env)
        p = subprocess.Popen(command, shell=False, env=env)
        p.communicate()
        if p.returncode != 0:
            print("Command returned non-zero exit code")
            exit(1)
