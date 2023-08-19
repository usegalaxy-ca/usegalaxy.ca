import fs from 'fs';
import { parse } from 'yaml';
import { validate, ClusterConfig } from './openstack/schema';
import { Provider } from './openstack/provider';
import { Instance } from './openstack/instance';
import { Volume } from './openstack/volume';
import { FloatingIp } from './openstack/floatingip';
import { Env } from './openstack/env';
import { Output } from '@pulumi/pulumi';

const CLUSTER_FILE_PATH = './cluster.yml';
const PROVIDER_NAME = 'Beluga Cloud';

//////////////////////////////////////////////////////////////////////////////
// Main
//////////////////////////////////////////////////////////////////////////////

//read cluster file
const clusterFile = readClusterFile(CLUSTER_FILE_PATH);
const clusterConfig = parseClusterFile(clusterFile);
const userClusterConfig = clusterConfig[Env.USERNAME];
if (userClusterConfig === undefined) {
  throw new Error(`Cluster not found for user ${Env.USERNAME}`);
}

//create provider
const provider = new Provider(PROVIDER_NAME);

//create instances
const instances: Map<string, Instance> = new Map();
const instanceConfigs = userClusterConfig.instances;
for (const serverGroupName in instanceConfigs) {
  const serverGroup = instanceConfigs[serverGroupName] || [];
  for (const instanceConfig of serverGroup) {
    const instance = new Instance(instanceConfig, provider);
    instances.set(instanceConfig.name, instance);
  }
}

//create and attach volumes
const volumes: Map<string, Volume> = new Map();
const volumeConfigs = userClusterConfig.volumes;
for (const volumeConfig of volumeConfigs) {
  const instance = instances.get(volumeConfig.attach_to);
  if (instance === undefined) {
    throw new Error(`Instance ${volumeConfig.attach_to} not found`);
  }
  const volume = new Volume(volumeConfig, instance, provider);
  volumes.set(volumeConfig.name, volume);
}

//attach floating ips
const floatingIps: FloatingIp[] = [];
const floatingIpConfigs = userClusterConfig.floating_ips;
for (const floatingIpConfig of floatingIpConfigs) {
  const instance = instances.get(floatingIpConfig.attach_to);
  if (instance === undefined) {
    throw new Error(`Instance ${floatingIpConfig.attach_to} not found`);
  }
  const floatingIp = new FloatingIp(floatingIpConfig, instance, provider);
  floatingIps.push(floatingIp);
}

//////////////////////////////////////////////////////////////////////////////
// Helper functions
//////////////////////////////////////////////////////////////////////////////

function readClusterFile(clusterFilePath: string): string {
  return fs.readFileSync(clusterFilePath, 'utf8');
}

function parseClusterFile(clusterFile: string): ClusterConfig {
  const clusterConfig = validate(parse(clusterFile));
  return clusterConfig;
}

//////////////////////////////////////////////////////////////////////////////
// Outputs
//////////////////////////////////////////////////////////////////////////////

function getPublicIps(
  floatingIps: FloatingIp[]
): Map<string, Output<string | undefined>> {
  const publicIps: Map<string, Output<string | undefined>> = new Map();
  for (const floatingIp of floatingIps) {
    const name = floatingIp.config.attach_to;
    const ip = floatingIp.fixedIp;
    publicIps.set(name, ip);
  }
  return publicIps;
}

export const publicIps = getPublicIps(floatingIps);
