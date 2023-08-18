import fs from 'fs';
import { parse } from 'yaml';
import { validate, ClusterConfig } from './openstack/schema';
import { OpenStackProvider } from './openstack/provider';
import { Instance } from './openstack/instance';
import { Env } from './openstack/env';

const CLUSTER_FILE_PATH = './cluster.yml';

function main() {
    const clusterFile = readClusterFile(CLUSTER_FILE_PATH);
    const clusterConfig = parseClusterFile(clusterFile);
    const userClusterConfig = clusterConfig[Env.USERNAME];
    if (userClusterConfig === undefined) {
        throw new Error(`Cluster not found for user ${Env.USERNAME}`);
    }

    const provider = new OpenStackProvider('Beluga Cloud');

    const instances: Instance[] = [];
    const instanceConfigs = userClusterConfig.instances;
    for (const serverGroupName in instanceConfigs) {
        const serverGroup = instanceConfigs[serverGroupName] || [];
        for (const instanceConfig of serverGroup) {
            const instance = new Instance(instanceConfig, provider);
            instances.push(instance);
        }
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
