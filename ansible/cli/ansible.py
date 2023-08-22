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
        self.yaml = "galaxy.yml"

    """
    Set the yaml file to run
    """
    def set_yaml(self, yaml: str) -> None:
        self.yaml = yaml

    """
    Add tags to the ansible command
    """
    def add_tags(self, *tags: str) -> None:
        self.tags.extend(tags)

    """
    Build an ansible playbook command
    """
    def _build_command(self) -> list[str]:
        command = "doppler run -- .venv/bin/ansible-playbook".split()
        tags = ["--tags", ",".join(self.tags)]
        command += tags + [self.yaml]
        return command

    """
    Build an ansible requirements command
    """
    def requirements(self) -> None:
        command = "doppler run -- .venv/bin/ansible-galaxy install -p roles -r requirements.yml".split()
        env = {"ANSIBLE_FORCE_COLOR": "true"}
        self.runner.run_cmd(command, env=env)


    """
    Run the ansible command
    """
    def run(self) -> None:
        command = self._build_command()
        env = {"ANSIBLE_FORCE_COLOR": "true"}
        self.runner.run_cmd(command, env=env)

