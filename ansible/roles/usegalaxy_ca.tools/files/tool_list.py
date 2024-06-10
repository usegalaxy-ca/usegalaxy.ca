import yaml
import os
import subprocess
from typing import Dict

tools_source = 'https://usegalaxy.eu'
raw_tools_path = '/tmp/raw_tools.yaml'
blacklist_path = '/tmp/blacklist.yaml'
customlist_path = '/tmp/customlist.yaml'
final_tools_path = '/tmp/final_tools.yaml'

def run_command(cmd: str):
    env = os.environ.copy()
    env.update(env)
    p = subprocess.Popen(cmd, shell=False, env=env)
    p.communicate()
    if p.returncode != 0:
        print("Command returned non-zero exit code")
        exit(1)

def get_tool_list(output_path: str):
    cmd = 'get-tool-list'
    args = ['-g', tools_source, '-o', output_path]
    " ".join([cmd] + args)
    run_command(cmd)

def parse_yaml(file_path: str) -> Dict:
    with open(file_path, 'r') as file:
        return yaml.load(file, Loader=yaml.FullLoader)

def write_yaml(file_path: str, data: Dict):
    with open(file_path, 'w') as file:
        yaml.dump(data, file)

class ToolListBuilder:
    def __init__(self):
        self.tool_list = {}

    def from_yaml(self, file_path: str):
        self.tool_list = parse_yaml(file_path)
        return self

    def with_blacklist(self, blacklist: list):
        self.tool_list['blacklist'] = blacklist
        return self

    def with_customlist(self, tool_name: str, file_path: str):
        self.tool_list[tool_name] = parse_yaml(file_path)
        return self

    def build(self):
        return self.tool_list



def main():
    get_tool_list(raw_tools_path)
    tool_list_builder = (
        ToolListBuilder()
        .from_yaml(raw_tools_path)
        .with_blacklist(['tool1', 'tool2'])
        .with_customlist('tool3', 'tool3.yaml')
        .build()
    )
    write_yaml(final_tools_path, tool_list_builder)
    

if __name__ == '__main__':
    main()
