from typing import List

from cli.runner import Runner

"""
Ansible class

Attributes:
    tags: A list of tags to run
"""
class Ansible:
    def __init__(self) -> None:
        self.tags = []
        self.runner = Runner()

    """
    Add tags to the ansible command
    """
    def add_tags(self, *tags: str) -> None:
        self.tags.extend(tags)

    """
    Build an ansible playbook command
    """
    def _build_command(self, playbook: str) -> list[str]:
        command = "doppler run -- .venv/bin/ansible-playbook".split()
        if self.tags:
            tags = ["--tags", ",".join(self.tags)]
            command += tags
        command += [playbook]
        return command

    """
    Build an ansible requirements command
    """
    def requirements(self, args: List[str]) -> None:
        command = str("doppler run -- .venv/bin/ansible-galaxy install -r requirements.yml --force").split() + args
        env = {"ANSIBLE_FORCE_COLOR": "true"}
        self.runner.run_cmd(command, env=env)


    """
    Run the ansible command
    """
    def run(self, playbook: str, args: List[str]) -> None:
        command = self._build_command(playbook) + args
        env = {"ANSIBLE_FORCE_COLOR": "true"}
        self.runner.run_cmd(command, env=env)

