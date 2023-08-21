import { readFile } from './openstack/utils';
import { getStackConfig } from './openstack/schema';
import { Env } from './openstack/env';
import { getPublicIps, getPrivateIps } from './openstack/output';
import { Stack } from './openstack/stack';
import {
  createInventoryFile,
  createVolumeVarsFile,
  createSlurmConfigFile,
} from './openstack/ansible';

//////////////////////////////////////////////////////////////////////////////
// Main
//////////////////////////////////////////////////////////////////////////////

//read config
const clusterFile = readFile(Env.CLUSTER_FILE_PATH);
const stackConfig = getStackConfig(clusterFile);
const stack = new Stack(stackConfig);

//create the resources
stack.buildInstances();
stack.buildVolumes();
stack.attachFloatingIps();

//create ansible files
createInventoryFile();
createVolumeVarsFile();
createSlurmConfigFile();

//output
export const publicIps = getPublicIps(stack.floatingIps);
export const privateIps = getPrivateIps(Array.from(stack.instances.values()));
