import fs from 'fs';
import { parse } from 'yaml';
import { validate, ClusterConfig } from './openstack/schema';
import { Provider } from './openstack/provider';
import { Instance } from './openstack/instance';
import { Volume } from './openstack/volume';
import { FloatingIp } from './openstack/floatingip';
import { Env } from './openstack/env';

const CLUSTER_FILE_PATH = './cluster.yml';

function main() {
    const clusterFile = readClusterFile(CLUSTER_FILE_PATH);
    const clusterConfig = parseClusterFile(clusterFile);
    const userClusterConfig = clusterConfig[Env.USERNAME];
    if (userClusterConfig === undefined) {
        throw new Error(`Cluster not found for user ${Env.USERNAME}`);
    }

    const provider = new Provider('Beluga Cloud');

    const instances: Map<string, Instance> = new Map();
    const instanceConfigs = userClusterConfig.instances;
    for (const serverGroupName in instanceConfigs) {
        const serverGroup = instanceConfigs[serverGroupName] || [];
        for (const instanceConfig of serverGroup) {
            const instance = new Instance(instanceConfig, provider);
            instances.set(instanceConfig.name, instance);
        }
    }

    const volumes: Volume[] = [];
    const volumeConfigs = userClusterConfig.volumes;
    for (const volumeConfig of volumeConfigs) {
        const instance = instances.get(volumeConfig.attach_to);
        if (instance === undefined) {
            throw new Error(`Instance ${volumeConfig.attach_to} not found`);
        }
        const volume = new Volume(volumeConfig, instance, provider);
        volumes.push(volume);
    }

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
}

function readClusterFile(clusterFilePath: string): string {
    return fs.readFileSync(clusterFilePath, 'utf8');
}

function parseClusterFile(clusterFile: string): ClusterConfig {
    const clusterConfig = validate(parse(clusterFile));
    return clusterConfig;
}

main();
