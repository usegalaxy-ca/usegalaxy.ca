import yaml
from typing import Dict

def get_tool_list():
    pass

def parse_yaml(file_path: str) -> Dict:
    with open(file_path, 'r') as file:
        return yaml.load(file, Loader=yaml.FullLoader)

def main():
    pass

if __name__ == '__main__':
    main()
