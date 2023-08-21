import { Output } from '@pulumi/pulumi';
import { FloatingIp } from './floatingip';
import { Instance } from './instance';

type IpAddresses = Record<string, Output<string | undefined>>;

export function getPublicIps(floatingIps: FloatingIp[]): IpAddresses {
  const publicIps: IpAddresses = {};
  for (const floatingIp of floatingIps) {
    const name = floatingIp.config.attach_to;
    const ip = floatingIp.fixedIp;
    publicIps[name] = ip;
  }
  return publicIps;
}

export function getPrivateIps(instances: Instance[]): IpAddresses {
  const privateIps: IpAddresses = {};
  for (const instance of instances) {
    const name = instance.config.name;
    const ip = instance.accessIpV4;
    privateIps[name] = ip;
  }
  return privateIps;
}
