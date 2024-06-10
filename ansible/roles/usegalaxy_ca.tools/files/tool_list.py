# Description: This script is used to generate the final tool list for the Galaxy instance.
# The script reads the tool list from the EU Galaxy instance, the extra tool list, and the blacklist.
# It then combines these lists to generate the final tool list.
import yaml
import os
import subprocess
import logging
from typing import Dict, List, Any

# ---------------------------- Logging ----------------------------

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ---------------------------- Paths ----------------------------

TOOLS_SOURCE = 'https://usegalaxy.eu'
EU_TOOLS_PATH = 'files/galaxy/tool_eu.yml'
BLACKLIST_PATH = 'files/galaxy/tool_blacklist.yml'
EXTRALIST_PATH = 'files/galaxy/tool_extra.yml'
FINAL_TOOLS_PATH = 'files/galaxy/tool_list.yml'

# ---------------------------- Types ----------------------------

Tool = Dict[str, Any]
Tools = List[Tool]
ToolsYaml = Dict[str, Tools]

# ---------------------------- Main ----------------------------

def main():
    logging.info("Fetching tool list from EU Galaxy instance...")
    get_tool_list(EU_TOOLS_PATH)
    logging.info("Tool list fetched successfully")

    logging.info("Generating final tool list...")
    eu_list = ToolList.from_yaml(EU_TOOLS_PATH)
    customlist = ToolList.from_yaml(EXTRALIST_PATH)
    blacklist = ToolList.from_yaml(BLACKLIST_PATH)

    final_list = (
        ToolListBuilder()
        .with_list(customlist)
        .with_list(eu_list)
        .with_blacklist(blacklist)
        .build()
    )
    final_list.to_yaml(FINAL_TOOLS_PATH)
    logging.info("Final tool list generated successfully")

# ---------------------------- Classes ----------------------------

class ToolList:
    tools: Tools

    def __init__(self, tools: ToolsYaml):
        if len(tools) == 0:
            self.tools = []
        else:
            self.tools = tools['tools']

    @staticmethod
    def from_yaml(path: str) -> 'ToolList':
        tools: ToolsYaml = parse_yaml(path)
        return ToolList(tools)

    def update(self, new_tools: 'ToolList'):
        seen = {}
        for i, tool in enumerate(self.tools):
            seen[tool['name']] = i
        
        for new_tool in new_tools.tools:
            if new_tool['name'] in seen:
                tool_idx = seen[new_tool['name']]
                cur_tool = self.tools[tool_idx]
                cur_revisions = set()
                for rev in cur_tool['revisions']:
                    cur_revisions.add(rev['revision'])
                for rev in new_tool['revisions']:
                    if rev not in cur_revisions:
                        cur_tool['revisions'].append(rev)
            else:
                self.tools.append(new_tool)

    def remove_tool(self, tool_name: str):
        self.tools = list(filter(lambda tool: tool['name'] != tool_name, self.tools))

    def remove_revision(self, tool_name: str, revision: str):
        for tool in self.tools:
            if tool['name'] == tool_name:
                tool['revisions'] = list(filter(lambda rev: rev['revisions'] != revision, tool['revisions']))

    def to_yaml(self, path: str):
        toolsYaml: ToolsYaml = {}
        toolsYaml['tools'] = self.tools
        write_yaml(path, toolsYaml)


class ToolListBuilder:
    def __init__(self):
        self.tool_list = ToolList({})
        self.blacklist = ToolList({})

    def with_list(self, new_list: 'ToolList') -> 'ToolListBuilder':
        self.tool_list.update(new_list)
        return self

    def with_blacklist(self, blacklist: 'ToolList') -> 'ToolListBuilder':
        self.blacklist.update(blacklist)
        return self

    def build(self) -> 'ToolList':
        for tool in self.blacklist.tools:
            if 'revision' not in tool:
                self.tool_list.remove_tool(tool['name'])
            else:
                self.tool_list.remove_revision(tool['name'], tool['revision'])
        return self.tool_list

# ---------------------------- Utils ----------------------------

def get_tool_list(output_path: str):
    cmd = 'get-tool-list'
    args = ['-g', TOOLS_SOURCE, '-o', output_path]
    run_command([cmd] + args)


def run_command(cmd: List[str]):
    env = os.environ.copy()
    env.update(env)
    p = subprocess.Popen(cmd, shell=False, env=env)
    p.communicate()
    if p.returncode != 0:
        print("Command returned non-zero exit code")
        exit(1)


def parse_yaml(file_path: str) -> Dict:
    with open(file_path, 'r') as file:
        return yaml.load(file, Loader=yaml.FullLoader)


def write_yaml(file_path: str, data: Dict):
    with open(file_path, 'w') as file:
        yaml.dump(data, file)

# --------------------------------------------------------------

if __name__ == '__main__':
    main()
