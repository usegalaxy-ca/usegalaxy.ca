import { LocalFile, LocalFileArgs } from './localfile';
import { Env } from './env';
import { templateFile } from './utils';
import path from 'path';

export function createInventoryFile() {
  const source = 'templates/inventory.ini';
  const dest = '../ansible/group_vars/inventory.ini';
  const args = {
    username: Env.USERNAME,
    groups: [],
  };

  return createFileFromTemplate(source, dest, args);
}

export function createVolumeVarsFile() {
  const source = 'templates/group_vars.yml';
  const dest = '../ansible/group_vars/volumes.yml';
  const args = {
    volumes: [],
  };

  return createFileFromTemplate(source, dest, args);
}

export function createSlurmConfigFile() {
  const source = 'templates/slurm.yml';
  const dest = '../ansible/group_vars/slurm.yml';
  const args = {
    nodes: [],
  };

  return createFileFromTemplate(source, dest, args);
}

function createFileFromTemplate(source: string, dest: string, args: object) {
  const content = templateFile(source, args);
  const configArgs: LocalFileArgs = {
    content: content,
    filename: dest,
    filePermission: '0644',
  };
  return new LocalFile(path.basename(source), configArgs);
}
