import { compute } from '@pulumi/openstack';
import { CloudInit } from './cloudinit';
import { InstanceConfig } from './schema';
import { Provider } from './provider';
import { getResourceName } from './utils';

export class Instance extends compute.Instance {
  public config: InstanceConfig;

  constructor(instanceConfig: InstanceConfig, provider: Provider) {
    const config = { ...instanceConfig, ...defaultInstanceConfig };

    const network = {
      uuid: config.network_uuid,
    };

    const bootDrive = {
      deleteOnTermination: true,
      destinationType: 'volume',
      sourceType: 'image',
      uuid: config.image_uuid,
      volumeSize: config.volume_size,
    };

    const cloudInit = new CloudInit('node').template();

    super(
      getResourceName(config.name),
      {
        imageName: config.image,
        flavorName: config.flavor,
        userData: cloudInit,
        blockDevices: [bootDrive],
        securityGroups: config.security_groups,
        networks: [network],
      },
      { provider: provider }
    );
    this.config = config;
  }
}

const defaultInstanceConfig = {
  volume_size: 30,
  image: 'Ubuntu-22.04.2-Jammy-x64-2023-02',
  image_uuid: 'db73980e-1f9c-441e-8268-c1881f99c8ef',
  network_uuid: '94db2a0a-14a4-4934-896d-a28bbc651b09',
  security_groups: ['default'],
  count: 1,
};

export const flavors = [
  'p1-1gb',
  'p1-2gb',
  'p2-3.75gb',
  'p4-7.5gb',
  'p8-15gb',
  'p4-15gb',
  'c8-30gb',
  'p8-30gb',
  'p16-60gb',
  'c16-60gb',
  'c8-90gb',
  'c16-90gb',
  'c16-120gb',
  'c32-240gb',
] as const;

export type Flavor = (typeof flavors)[number];

type Resources = {
  cpu: number; // in vCPUs
  ram: number; // in GB
};

export function resources(flavor: Flavor): Resources {
  const info = flavor.split('-');
  let cpu = 0;
  let ram = 0;
  for (const entry of info) {
    if (entry.startsWith('c')) {
      cpu = parseInt(entry.slice(1));
    } else if (entry.endsWith('gb')) {
      ram = parseInt(entry.slice(0, -2));
    }
  }
  return { cpu, ram };
}
