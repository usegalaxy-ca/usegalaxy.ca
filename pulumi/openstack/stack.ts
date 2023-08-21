import {
  StackConfig,
  VolumeConfig,
  InstanceConfig,
  FloatingIpConfig,
} from './/schema';
import { Provider } from './provider';
import { Instance } from './instance';
import { Volume } from './volume';
import { FloatingIp } from './floatingip';
import { Env } from './env';

export class Stack {
  config: StackConfig;
  provider: Provider;
  instances: Map<string, Instance>;
  instanceConfigs: Record<string, InstanceConfig[]>;
  volumes: Map<string, Volume>;
  volumeConfigs: VolumeConfig[];
  floatingIps: FloatingIp[];
  floatingIpConfigs: FloatingIpConfig[];

  constructor(config: StackConfig) {
    this.config = config;
    this.provider = new Provider(Env.PROVIDER_NAME);
    this.instances = new Map();
    this.instanceConfigs = config.instances;
    this.volumes = new Map();
    this.volumeConfigs = config.volumes;
    this.floatingIps = [];
    this.floatingIpConfigs = config.floating_ips;
  }

  buildInstances() {
    for (const serverGroupName in this.instanceConfigs) {
      const serverGroup = this.instanceConfigs[serverGroupName] || [];
      for (const instanceConfig of serverGroup) {
        const instance = new Instance(instanceConfig, this.provider);
        this.instances.set(instanceConfig.name, instance);
      }
    }
  }

  buildVolumes() {
    for (const volumeConfig of this.volumeConfigs) {
      const instance = this.instances.get(volumeConfig.attach_to);
      if (instance === undefined) {
        throw new Error(`Instance ${volumeConfig.attach_to} not found`);
      }
      const volume = new Volume(volumeConfig, instance, this.provider);
      this.volumes.set(volumeConfig.name, volume);
    }
  }

  attachFloatingIps() {
    for (const floatingIpConfig of this.floatingIpConfigs) {
      const instance = this.instances.get(floatingIpConfig.attach_to);
      if (instance === undefined) {
        throw new Error(`Instance ${floatingIpConfig.attach_to} not found`);
      }
      const floatingIp = new FloatingIp(floatingIpConfig, instance, provider);
      this.floatingIps.push(floatingIp);
    }
  }
}
