import { Instance } from './instance';
import { Volume } from './volume';
import { FloatingIp } from './floatingip';
import pulumi from '@pulumi/pulumi';

export function getPublicIps(floatingIps: FloatingIp[]): Map<string, string> {
    for (const floatingIp of floatingIps) {
        const name = floatingIp.config.attach_to;
        const ip = floatingIp.fixedIp;
        pulumi.interpolate`
  }
  return ipMap;
}

export function getPrivateIps(instances: Instance[]): Map<string, string> {
  const ipMap: Map<string, string> = new Map();
  return ipMap;
}

export function getAnsibleHosts(instances: Instance[]) {
  return 'TODO';
}

export function getAnsibleVolumes(volumes: Volume[]) {
  return 'TODO';
}
