"""
This file contains the DependencyManager class which is used to verify that all dependencies are installed
"""
import shutil
import os
from cli.runner import Runner


class DependencyManager():
    def __init__(self):
        self.runner = Runner()

    """
    Verify that all dependencies are installed
    """
    def verify_all(self) -> None:
        self.verify_ansible()
        self.verify_doppler()
        self.verify_venv()

    """
    Verify that ansible is installed
    """
    def verify_ansible(self) -> None:
        if not self.ansible_exists():
            print("Ansible is not installed. Please install ansible before running this script")
            exit(1)

    """
    Verify that doppler is installed
    """
    def verify_doppler(self) -> None:
        if not self.doppler_exists():
            print("Doppler is not installed. Please install doppler before running this script")
            exit(1)
    
    """
    Verify that the venv is setup
    """
    def verify_venv(self) -> None:
        if not self.venv_exists():
            print("venv is not setup. Please run ./usegalaxy.py requirements")
            exit(1)

    """
    Create or Update the venv
    """
    def update_venv(self) -> None:
        if not self.venv_exists():
            self.create_venv()
        self.install_requirements()

    """
    check if ansible is installed
    """
    def ansible_exists(self) -> bool:
        return shutil.which("ansible-playbook") is not None

    """
    check if doppler is installed
    """
    def doppler_exists(self) -> bool:
        return shutil.which("doppler") is not None

    """
    check if venv exists
    """
    def venv_exists(self) -> bool:
        return os.path.isdir(".venv")

    """
    create a venv
    """
    def create_venv(self) -> None:
        cmd = "python3 -m venv .venv".split(" ")
        self.runner.run_cmd(cmd)

    """
    install requirements
    """
    def install_requirements(self) -> None:
        cmd = ".venv/bin/python -m pip install -r requirements.txt".split(" ")
        self.runner.run_cmd(cmd)
