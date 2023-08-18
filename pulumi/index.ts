import fs from "fs";
import { parse } from "yaml";
import { validate, ClusterConfig } from "./openstack/schema";
import { OpenStackProvider } from "./openstack/provider";
import { Instance } from "./openstack/instance";
import { Env } from "./openstack/env";

const CLUSTER_FILE_PATH = "./cluster.yml";

function main() {
    const clusterFile = readClusterFile(CLUSTER_FILE_PATH);
    const clusterConfig = parseClusterFile(clusterFile);
    const userClusterConfig = clusterConfig[Env.USER_NAME];
    if (userClusterConfig === undefined) {
        throw new Error(`Cluster not found for user ${Env.USER_NAME}`);
    }

    const provider = new OpenStackProvider("Beluga Cloud");
    const instances: Instance[] = [];
    for (const instanceConfig of userClusterConfig.instances) {
        instances.push(new Instance(instanceConfig));
    }
}

function readClusterFile(clusterFilePath: string): string {
    return fs.readFileSync(clusterFilePath, "utf8");
}

function parseClusterFile(clusterFile: string): ClusterConfig {
    const clusterConfig = validate(parse(clusterFile));
    return clusterConfig;
}

main();
